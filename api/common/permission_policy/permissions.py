from collections import OrderedDict
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from enum import Enum
from guardian.core import ObjectPermissionChecker
from guardian.shortcuts import get_anonymous_user
from rest_framework.permissions import BasePermission, SAFE_METHODS
from typing import Any, Dict, List, Literal, Optional, Tuple, Union, Iterable, Type
import copy
import logging
import sys
if sys.version_info < (3, 11):
    from typing_extensions import TypedDict, NotRequired
else:
    from typing import TypedDict, NotRequired

from common.utils import import_from_string
from .parser import basic_expression_parser, lalr_expression_parser, ExpressionTransformer, Rule


User = get_user_model()

logger = logging.getLogger("core")


class PolicyRuleOperator(Enum):
    And = "and"
    Or = "or"


class PolicyRule(TypedDict):
    action: Union[str, List[str]]
    condition: NotRequired[str]
    operator: NotRequired[PolicyRuleOperator]


class FieldScopeRule(TypedDict):
    condition: str
    fields: NotRequired[Union[str, List[str]]]
    exclude_fields: NotRequired[Union[str, List[str]]]


action_shortcuts: Dict[str, Union[str, Iterable[str]]] = {
    "<safe_methods>": SAFE_METHODS,
    "<unsafe_methods>": ["post", "put", "patch", "delete"],
}


if hasattr(settings, "PERMISSION_POLICY_GLOBALS") and isinstance(settings.PERMISSION_POLICY_GLOBALS, str):
    settings.PERMISSION_POLICY_GLOBALS = import_from_string(
        settings.PERMISSION_POLICY_GLOBALS)


class PermissionPolicy(BasePermission):
    """
    Permission class that allows to define a set of rules to check if the user
    is authorized to perform the action on the view or object.
    The rules are defined in the 'rules' attribute and the object level rules
    are defined in the 'object_rules' attribute (note that the 'rules' are checked
    automatically for by the view, but the 'object_rules' must be checked manually
    using the `check_object_permissions` view method).

    The `rules` and `object_rules` are defined as a list of dictionaries with the following keys:
    - `action` (required): A string or a list of strings that represents the action(s) that
                the user is trying to perform.
                The action can be a view action name or a request method name
                when the action is not defined in the view.
                Any action is unauthorized by default, so the rules must be set
                explicitly for each action.
                Passing a wild card ("*" or ["*"]) will match any action.

    - `condition`: An optional string that represents the condition that the user must
                meet to perform the action. Passing a wild card ("*") will mark that
                rule as granted, even if there are other rules for the same action that would deny it.
                The condition is a expression formed by a set of rules formed by the
                type and the name of the rule, separated by a colon (i.e., permission:tasks.view_task).
                The expression allows the use of logical operators (and, or, not) and parentheses for grouping.
                The following types are supported:

                - `permission`: A string that represents the permission that the user must have to perform the action.

                - `group`: A string that represents the group that the user must belong to in order to perform the action.

                - `callable`: A string that represents the name of a callable that will be
                            checked to grant the permission. The callable must be defined
                            in the permission policy class. This is the only type that does not
                            require the type name to be present in the expression 
                            (so `callable:is_authenticated` is equivalent to `is_authenticated`).
                            Callables also can accept arguments, that are separated by colons and
                            are passed to the callable *args parameter at the end of the callable.
                            The supported types for the arguments are: 
                                - string: Any string. Double quotes (") can be used to wrap the string if it contains spaces or special characters.
                                          Nested double quotes are not supported.
                                - boolean: True, or False (case insensitive).
                                - integer: int numbers.
                                - float: float numbers.
                            (i.e., my_callable:10:True:false).
                            Callables accept the following parameters:
                            - `request`: The request object.
                            - `view`: The view object.
                            - `action`: The view action or request method.
                            - `method`: The request method.
                            - `obj`: The object(s) that the user is trying to access (for object
                                    level permissions, `None` for view level permissions).
                            - `*args`: The arguments passed to the callable, if any.
                            Global callables can be defined in a class as @classmethods, and this class
                            should be defined in the `PERMISSION_POLICY_GLOBALS` setting.
                            These callables accept the instance of the permission policy class as the first parameter
                            and the rest of the parameters are the same as the instance callables.

    - `operator`: An optional string that represents the operator that will be used to
                merge the conditions of the rule. `And` by default. Rules are merged from top
                bottom, so the operator is ignored if the rule is the first in the list for the
                given action. Each rule's condition is wrapped in parentheses in order to perform
                the merge, for example, the following rule conditions "permission:myapp.view_user"
                and "is_authenticated and group:my_group" will be merged as
                "(permission:myapp.view_user) and (is_authenticated and group:my_group)".

    The `field_scope_rules` attribute allows to define a set of rules that will be used to
    scope the fields of the serializer based on the request user. These rules are checked in the order they're
    defined, and the first rule that matches the user will be used to scope the fields.
    The rules are defined as a list of dictionaries with the following keys:
    - `condition` (required): A string that represents the condition that the user must meet to
                scope the fields of the serializer. The expression follows the same rules as the
                `condition` attribute of the `rules` and `object_rules` attributes.
    - `fields` (optional): A string or a list of strings that represents the fields that will be
                included in the serializer. If empty or set to "__all__" or ["__all__"], all fields 
                will be included.
    - `exclude_fields` (optional): A string or a list of strings that represents the fields that will be
                excluded from the serializer. If set to "__all__" or ["__all__"], all fields will be excluded.
                Fields are excluded from the ones scoped by the `fields` attribute.

    The `action_shortcuts` attribute allows to define a set of shortcuts that can be used
    in the rules to expand the actions. The shortcuts are defined as a dictionary where the
    key is the shortcut name and the value is a string or list of actions that will be expanded when
    the shortcut is used in the rule. The shortcuts defined in the `action_shortcuts` attribute
    will be merged with the built-in shortcuts, so the built-in shortcuts can be overridden
    by defining a shortcut with the same name in the `action_shortcuts` attribute.

    The `superuser_full_access` attribute allows to define if the superuser has full access
    to the view or object. If set to `True` (default), the superuser will have full access
    to the view or object. If set to `False`, the superuser will be treated as a regular user
    and the rules will be checked for the superuser as well (note that django always return 
    true for Permissions).

    The `parser` attribute allows to define the parser that will be used to parse the rule
    conditions. The `lalr` parser is used by default, and it's faster and most performant
    than the `basic` parser.
    """
    rules: Optional[List[PolicyRule]] = None
    object_rules: Optional[List[PolicyRule]] = None
    field_scope_rules: Optional[List[FieldScopeRule]] = None
    action_shortcuts: Dict[str, Union[str, Iterable[str]]] = {}
    superuser_full_access: bool = True
    parser: Literal["lalr", "basic"] = "lalr"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.action_shortcuts = {
            **action_shortcuts,
            **self.action_shortcuts
        }

        self.cache = {}
        self.__cache = {
            "request": None,
            "view": None,
        }

        self.obj_permission_checker = None

    def has_permission(self, request, view) -> bool:
        """
        Checks if the user has permission to perform the action on the view.
        """
        self._set_internal_cache_(request, view)
        if not self.rules:
            return False

        return self._check_permissions_(self.rules, request, view)

    def has_object_permission(self, request, view, obj) -> bool:
        """
        Checks if the user has permission to perform the action on the object.
        """
        self._set_internal_cache_(request, view)

        if not self.object_rules:
            return False
        return self._check_permissions_(self.object_rules, request, view, obj)

    def eval_expression(self, expression: str, obj=None) -> bool:
        """
        Evaluates the expression and returns `True` if the user meets the given condition(s).
        """

        if not expression:
            logger.debug("Permission denied: Empty expression")
            return False
        if expression == "*":
            logger.debug("Permission granted: '*'")
            return True

        request = self.__cache.get("request")
        view = self.__cache.get("view")
        action = self._get_called_action_or_method_(request, view)

        if not hasattr(request, "user") or request.user.is_anonymous:
            user = get_anonymous_user()
        else:
            user = request.user

        if not user.is_active:
            logger.debug("Permission denied: User is not active")
            return False

        if user.is_superuser and self.superuser_full_access:
            logger.debug("Permission granted: Superuser has full access")
            return True

        parsed_expression = self._parse_expression_(expression)

        if obj:
            if not self.obj_permission_checker:
                self.obj_permission_checker = ObjectPermissionChecker(user)
            if hasattr(obj, "__iter__"):
                self.obj_permission_checker.prefetch_perms(obj)
                return all(parsed_expression.eval(self, request, view, action, request.method, o) for o in obj)

        authorized = parsed_expression.eval(
            self, request, view, action, request.method, obj)
        logger.debug(
            f"Permission {'granted' if authorized else 'denied'}: '{expression}'")
        return authorized

    def scope_fields(self, serializer_class):
        """
        Scopes the fields of the serializer based on the field scope rules.
        """
        if not self.field_scope_rules:
            return serializer_class

        request = self.__cache.get("request")
        view = self.__cache.get("view")

        action = self._get_called_action_or_method_(request, view)
        method = request.method

        serializer_dict = copy.deepcopy(dict(serializer_class.__dict__))
        serializer_fields = serializer_dict["_declared_fields"]
        fields = None
        exclude_fields = None

        for rule in self.field_scope_rules:
            parsed_expression = self._parse_expression_(rule["condition"])
            if parsed_expression.eval(self, request, view, action, method):
                fields = get_as_iterable(
                    rule["fields"]) if "fields" in rule else None
                exclude_fields = get_as_iterable(
                    rule["exclude_fields"]) if "exclude_fields" in rule else None
                break

        if not fields and not exclude_fields:
            return serializer_class

        if fields:
            if fields != ["__all__"]:
                for field in list(serializer_fields.keys()):
                    if field not in fields:
                        serializer_fields.pop(field, None)

        if exclude_fields:
            if exclude_fields == ["__all__"]:
                serializer_fields = OrderedDict()
            else:
                for field in exclude_fields:
                    serializer_fields.pop(field, None)

        # Add the fields to the `serializer_dict` so they are available in the new serializer
        serializer_dict.update(serializer_fields)

        return type(f"Scoped{serializer_class.__name__}", serializer_class.__bases__, serializer_dict)

    def _set_internal_cache_(self, request, view):
        self.__cache["request"] = request
        self.__cache["view"] = view

        if isinstance(view, PermissionPolicyViewMixin):
            view.permission_policy = self

    def _check_permissions_(self, rules: List[PolicyRule], request, view, obj=None) -> bool:
        action = self._get_called_action_or_method_(request, view)
        matching_rules = self._find_matching_rules_(
            action, request.method, rules)
        expression = self._merge_rule_conditions_(matching_rules)
        print(action, matching_rules, expression)
        print(self.eval_expression(expression, obj))

        return self.eval_expression(expression, obj)

    def _find_matching_rules_(self, action: str, method: str, rules: List[PolicyRule]) -> List[PolicyRule]:
        action = action.upper()
        method = method.upper()
        matching_rules = []
        for rule in rules:
            rule_actions = self._get_expanded_actions_(rule)
            if rule_actions == ["*"] or action in rule_actions or method in rule_actions:
                matching_rules.append(rule)
        return matching_rules

    def _get_expanded_actions_(self, rule: PolicyRule) -> List[str]:
        actions = get_as_iterable(rule["action"])
        expanded_actions = []
        for action in actions:
            if action in self.action_shortcuts:
                expanded_actions += get_as_iterable(
                    self.action_shortcuts[action])
            else:
                expanded_actions.append(action)
        return [x.upper() for x in expanded_actions]

    def _merge_rule_conditions_(self, rules: List[PolicyRule]) -> str:
        expression = ""
        for rule in rules:
            operator = rule.get("operator", PolicyRuleOperator.And).value
            if "condition" in rule:
                condition = rule["condition"].strip()
                if condition == "*":
                    return condition
                if expression:
                    expression += " " + operator
                expression += " (" + condition + ")"
        return expression.strip()

    def _parse_expression_(self, expression: str) -> Rule:
        if self.parser == "lalr":
            return lalr_expression_parser.parse(expression)
        else:
            tree = basic_expression_parser.parse(expression)
            transformer = ExpressionTransformer()
            return transformer.transform(tree)

    def _get_called_action_(self, request, view) -> Optional[str]:
        if hasattr(view, "action"):
            if hasattr(view, "action_map"):
                return view.action or view.action_map[request.method]
            return view.action

        return None

    def _get_called_action_or_method_(self, request, view) -> str:
        action = self._get_called_action_(request, view)
        return action or request.method

    # Built-in callables:

    def is_authenticated(self, request, view, action: str, obj: Optional[Any], *args: Tuple[str]) -> bool:
        return request.user.is_authenticated

    def is_anonymous(self, request, view, action: str, obj: Optional[Any], *args: Tuple[str]) -> bool:
        return request.user.is_anonymous

    def is_staff(self, request, view, action: str, obj: Optional[Any], *args: Tuple[str]) -> bool:
        return request.user.is_staff

    def is_superuser(self, request, view, action: str, obj: Optional[Any], *args: Tuple[str]) -> bool:
        return request.user.is_superuser


def get_as_iterable(value: Union[str, Iterable[str]]) -> Iterable[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    elif hasattr(value, "__iter__"):
        return value
    else:
        raise ValueError(
            "Expected a string or a iterable collection of strings.")


def get_indexed(index, iterable, default=None):
    return iterable[index] if len(iterable) > index else default


class PermissionPolicyViewMixin:
    """
    Mixin class that allows to set the permission policy class in the view class.
    Using this mixin is necessary if planning to use the `PermissionPolicy.scope_fields`
    method to scope the fields of the serializer.
    """
    permission_policy_class: Optional[Type[PermissionPolicy]] = None

    permission_policy: PermissionPolicy = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.permission_policy:
            raise ImproperlyConfigured(
                "The 'permission_policy' must not be set in the view class.")

        if self.permission_policy_class:
            if not issubclass(self.permission_policy_class, PermissionPolicy):
                raise ImproperlyConfigured(
                    "The 'permission_policy_class' attribute must be a subclass of 'PermissionPolicy'.")

            self.permission_classes = [self.permission_policy_class]
