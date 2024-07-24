from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group as DjangoGroup, Permission as DjangoPermission
from django.test.client import RequestFactory
from guardian.shortcuts import get_anonymous_user, assign_perm
from coveo_ref import ref
from rest_framework import exceptions, response, serializers
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
import pytest

from common.decorators import map_actions
from common.permission_policy.permissions import PolicyRule, PermissionPolicy, PolicyRuleOperator
from common.permission_policy.parser import basic_expression_parser, lalr_expression_parser, ExpressionTransformer, And, Or, Not, Group, Permission, Callable


@pytest.fixture
def admin_group_user(db, django_user_model):
    user = django_user_model.objects.create(username="adminuser")
    group = DjangoGroup.objects.create(name="Admin")
    user.groups.add(group)
    return user


@pytest.fixture
def user(db, django_user_model):
    user = django_user_model.objects.create(username="testuser")
    permission = DjangoPermission.objects.get(codename="view_user")
    user.user_permissions.add(permission)
    return user


class GlobalExampleCallables:
    @classmethod
    def global_callable(cls, policy, request, view, action, obj):
        return True


class ExampleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()


@pytest.fixture
def permission_class():
    class ExamplePermissionPolicy(PermissionPolicy):
        rules = [
            {
                "action": "*",
                "condition": "is_authenticated and group:Admin",
            },
            {
                "action": "get",
                "condition": "permission:users.view_user",
                "operator": PolicyRuleOperator.Or,
            },
            {
                "action": "list",
                "condition": "permission:users.view_user",
                "operator": PolicyRuleOperator.Or,
            },
            {
                "action": "post",
                "condition": "*",
            },
            {
                "action": "patch",
                "condition": "permission:users.change_user",
            },
            {
                "action": "put",
                "condition": "has_special_values:1:True:5.5:secret",
                "operator": PolicyRuleOperator.Or,
            },
            {
                "action": "delete",
                "condition": "global_callable",
                "operator": PolicyRuleOperator.Or,
            }
        ]
        object_rules = [
            {
                "action": "get",
                "condition": "permission:view_user and has_username:John:Doe:Moe",
            }
        ]
        field_scope_rules = [
            {
                "condition": "group:Admin",
                "fields": ["id", "username", "email"],
                "exclude_fields": ["email"],
            },
            {
                "condition": "permission:users.view_user and not group:Admin",
                "fields": ["username", "email"]
            },
        ]
        action_shortcuts = {
            "<other>": ["get", "post"]
        }

        def has_value(self, request, view, action, obj, value: bool):
            return value

        def has_special_values(self, request, view, action, obj, value1: int, value2: bool, value3: float, value4: str):
            return value1 == 1 and value2 == True and value3 == 5.5 and value4 == "secret"

        def has_username(self, request, view, action, obj, *names):
            return obj.username in names

    return ExamplePermissionPolicy


@pytest.fixture
def permission(permission_class):
    return permission_class()


@pytest.fixture
def api_view_class(permission_class):
    @map_actions(crud=True)
    class ExampleApiView(APIView):
        permission_classes = [permission_class]

        def get(self, request):
            pass
    return ExampleApiView


class TestPermissionPolicy:
    def test_matching_rule(self, rf: RequestFactory, permission):
        matching_rules = permission._find_matching_rules_(
            "list", "GET", permission.rules)
        expected = [
            permission.rules[0],
            permission.rules[1],
            permission.rules[2],
        ]

        assert matching_rules == expected

    def test_expand_rule_shortcut_actions(self, permission):
        rule1: PolicyRule = {
            "action": "<safe_methods>",
        }
        rule2: PolicyRule = {
            "action": "<unsafe_methods>",
        }
        rule3: PolicyRule = {
            "action": ["<other>", "my_action"],
        }

        actions1 = permission._get_expanded_actions_(rule1)
        actions2 = permission._get_expanded_actions_(rule2)
        actions3 = permission._get_expanded_actions_(rule3)

        expected1 = ["GET", "HEAD", "OPTIONS"]
        expected2 = ["POST", "PUT", "PATCH", "DELETE"]
        expected3 = ["GET", "POST", "MY_ACTION"]

        assert actions1 == expected1 \
            and actions2 == expected2 \
            and actions3 == expected3

    def test_merge_rules_expressions_and_operator(self, permission):
        matching_rules = permission._find_matching_rules_(
            "patch", "patch", permission.rules)
        expression = permission._merge_rule_conditions_(matching_rules)
        expected = "(is_authenticated and group:Admin) and (permission:users.change_user)"

        assert expression == expected

    def test_merge_rules_expressions_or_operator(self, permission):
        matching_rules = permission._find_matching_rules_(
            "get", "get", permission.rules)
        expression = permission._merge_rule_conditions_(matching_rules)
        expected = "(is_authenticated and group:Admin) or (permission:users.view_user)"

        assert expression == expected

    def test_merge_rules_expressions_wild_card(self, permission):
        matching_rules = permission._find_matching_rules_(
            "post", "post", permission.rules)
        expression = permission._merge_rule_conditions_(matching_rules)
        expected = "*"

        assert expression == expected

    def test_empty_permission_rules_are_unauthorized(self, rf: RequestFactory, user):
        request = rf.get("/")
        request.user = user
        request.authenticators = None
        view = APIView()

        class EmptyPermissionPolicy1(PermissionPolicy):
            pass  # rules = None
        view.permission_classes = [EmptyPermissionPolicy1]
        with pytest.raises(exceptions.PermissionDenied):
            view.check_permissions(request)

        class EmptyPermissionPolicy2(PermissionPolicy):
            rules = []
        view.permission_classes = [EmptyPermissionPolicy2]
        with pytest.raises(exceptions.PermissionDenied):
            view.check_permissions(request)

    def test_rule_without_condition_is_unauthorized(self, rf: RequestFactory, user, permission_class):
        request = rf.get("/")
        request.user = user
        request.authenticators = None
        view = APIView()

        class ExamplePermissionPolicy(PermissionPolicy):
            rules = [
                {
                    "action": "*",
                }
            ]
        view.permission_classes = [ExamplePermissionPolicy]
        with pytest.raises(exceptions.PermissionDenied):
            view.check_permissions(request)

    def test_superuser_full_access_authorized(self, rf: RequestFactory, admin_user, api_view_class: APIView):
        request = rf.patch("/")
        request.user = admin_user
        api_view_class().check_permissions(request)

    def test_superuser_full_access_unauthorized(self, rf: RequestFactory, admin_user, api_view_class: APIView):
        request = rf.patch("/")
        request.user = admin_user
        request.authenticators = None
        view = api_view_class()

        class ExamplePermissionPolicy(PermissionPolicy):
            rules = [
                {
                    "action": "*",
                    "condition": "is_authenticated and group:User",
                },
            ]
            superuser_full_access = False

        view.permission_classes = [ExamplePermissionPolicy]
        with pytest.raises(exceptions.PermissionDenied):
            view.check_permissions(request)

    def test_user_is_authorized_by_group(self, rf: RequestFactory, admin_group_user, api_view_class: APIView):
        request = rf.get("/")
        request.user = admin_group_user
        request.authenticators = None
        api_view_class().check_permissions(request)

    def test_user_is_authorized_by_permission(self, rf: RequestFactory, user, api_view_class: APIView):
        request = rf.get("/")
        request.user = user
        request.authenticators = None
        api_view_class().check_permissions(request)

    def test_user_is_authorized_by_callable(self, rf: RequestFactory, user, api_view_class: APIView):
        request = rf.put("/")
        request.user = user
        request.authenticators = None
        api_view_class().check_permissions(request)

    def test_user_is_authorized_by_global_callable(self, settings, rf: RequestFactory, user, api_view_class: APIView):
        settings.PERMISSION_POLICY_GLOBALS = GlobalExampleCallables
        request = rf.delete("/")
        request.user = user
        request.authenticators = None
        api_view_class().check_permissions(request)

    def test_authorized_by_wildcard(self, rf: RequestFactory, user, api_view_class: APIView):
        request = rf.post("/")
        request.user = user
        request.authenticators = None
        api_view_class().check_permissions(request)

    def test_user_is_authorized_by_object_rule(self, rf: RequestFactory, user, django_user_model, api_view_class: APIView):
        request = rf.get("/")
        request.user = user
        request.authenticators = None
        obj = django_user_model.objects.create(username="John")
        assign_perm("view_user", user, obj)

        api_view_class().check_object_permissions(request, obj)

    def test_user_is_unauthorized_by_object_rule(self, rf: RequestFactory, user, django_user_model, api_view_class: APIView):
        request = rf.get("/")
        request.user = user
        request.authenticators = None
        obj = django_user_model.objects.create(username="John")

        with pytest.raises(exceptions.PermissionDenied):
            api_view_class().check_object_permissions(request, obj)

        assign_perm("view_user", user, obj)
        obj.username = "Not John"  # Should fail by the has_username rule now

        with pytest.raises(exceptions.PermissionDenied):
            api_view_class().check_object_permissions(request, obj)

    def test_user_is_authorized_by_object_rule_multiple(self, rf: RequestFactory, user, django_user_model, api_view_class: APIView):
        request = rf.get("/")
        request.user = user
        request.authenticators = None
        objects = [
            django_user_model.objects.create(username="John"),
            django_user_model.objects.create(username="Doe"),
            django_user_model.objects.create(username="Moe"),
        ]
        for obj in objects:
            assign_perm("view_user", user, obj)

        api_view_class().check_object_permissions(request, objects)

    def test_scope_fields_explicit_list(self, rf: RequestFactory, user, permission, api_view_class: APIView):
        request = rf.get("/")
        request.user = user
        request.authenticators = None
        view = api_view_class
        permission._set_internal_cache_(request, view)

        data = {
            "id": 1,
            "username": "testuser",
            "email": "testuser@example.com",
        }

        ScopedSerializer = permission.scope_fields(ExampleSerializer)
        serializer = ScopedSerializer(data)
        expected = {
            "username": "testuser",
            "email": "testuser@example.com",
        }

        assert serializer.data == expected

    def test_scope_fields_ignore_fields(self, rf: RequestFactory, admin_group_user, permission, api_view_class: APIView):
        request = rf.get("/")
        request.user = admin_group_user
        request.authenticators = None
        view = api_view_class
        permission._set_internal_cache_(request, view)

        data = {
            "id": 1,
            "username": "testuser",
            "email": "testuser@example.com",
        }

        ScopedSerializer = permission.scope_fields(ExampleSerializer)
        serializer = ScopedSerializer(data)
        expected = {
            "id": 1,
            "username": "testuser",
        }

        assert serializer.data == expected

    def test_scope_fields_no_condition_met(self, db, rf: RequestFactory, permission, api_view_class: APIView):
        request = rf.get("/")
        request.user = get_anonymous_user()
        request.authenticators = None
        view = api_view_class
        permission._set_internal_cache_(request, view)

        data = {
            "id": 1,
            "username": "testuser",
            "email": "testuser@example.com",
        }

        ScopedSerializer = permission.scope_fields(ExampleSerializer)
        serializer = ScopedSerializer(data)

        assert serializer.data == data


def basic_parser(exp):
    tree = basic_expression_parser.parse(exp)
    return ExpressionTransformer().transform(tree)


def lalr_parser(exp):
    return lalr_expression_parser.parse(exp)


@pytest.mark.parametrize("parse", [basic_parser, lalr_parser])
class TestPermissionPolicyExpressionParser:
    def test_parse_expression_permission(self, parse):
        expression = "permission:users.view_user"
        permission = parse(expression)

        assert type(permission) == Permission \
            and permission.name == "users.view_user"

    def test_parse_expression_group(self, parse):
        expression = "group:Admin"
        group = parse(expression)

        assert type(group) == Group \
            and group.name == "Admin"

    def test_parse_expression_callable_no_args(self, parse):
        expression = "has_value"
        callable = parse(expression)

        assert type(callable) == Callable \
            and callable.name == "has_value" \
            and callable.args == []

    def test_parse_expression_named_callable_no_args(self, parse):
        expression = "callable:has_value"
        callable = parse(expression)

        assert type(callable) == Callable \
            and callable.name == "has_value" \
            and callable.args == []

    def test_parse_expression_callable_args(self, parse):
        expression = "has_value:string:true:False:1:10.5"
        callable = parse(expression)

        assert callable.args == ["string", True, False, 1, 10.5] \
            and type(callable.args[0]) == str \
            and type(callable.args[1]) == bool \
            and type(callable.args[2]) == bool \
            and type(callable.args[3]) == int \
            and type(callable.args[4]) == float

    def test_parse_expression_named_callable_args(self, parse):
        expression = "callable:has_value:string:true:False:1:10.5"
        callable = parse(expression)

        assert callable.args == ["string", True, False, 1, 10.5] \
            and type(callable.args[0]) == str \
            and type(callable.args[1]) == bool \
            and type(callable.args[2]) == bool \
            and type(callable.args[3]) == int \
            and type(callable.args[4]) == float

    def test_parse_expression_callable_quoted_string(self, parse):
        expression1 = 'has_value:"string with spaces and :"'
        callable1 = parse(expression1)
        expression2 = "has_value:\"string with spaces and :\""
        callable2 = parse(expression2)

        assert callable1.args == ["string with spaces and :"] \
            and type(callable1.args[0]) == str \
            and callable2.args == ["string with spaces and :"] \
            and type(callable2.args[0]) == str

    def test_parse_multiline_expression(self, parse):
        expression = """
            is_authenticated
            and has_value:"Hello World"
        """
        tree = parse(expression)

        assert type(tree) == And \
            and type(tree.values[0]) == Callable \
            and type(tree.values[1]) == Callable \
            and tree.values[1].args == ["Hello World"]

    def test_parse_complex_expression(self, parse):
        expression = "is_authenticated and (group:Admin or group:User and not has_value:false) or permission:users.view_user"
        #                                      implicit -> (                                 )
        tree = parse(expression)

        assert type(tree) == Or \
            and type(tree.values[0]) == And \
            and type(tree.values[0].values[0]) == Callable \
            and type(tree.values[0].values[1]) == Or \
            and type(tree.values[0].values[1].values[0]) == Group and tree.values[0].values[1].values[0].name == "Admin" \
            and type(tree.values[0].values[1].values[1]) == And \
            and type(tree.values[0].values[1].values[1].values[0]) == Group and tree.values[0].values[1].values[1].values[0].name == "User" \
            and type(tree.values[0].values[1].values[1].values[1]) == Not \
            and type(tree.values[0].values[1].values[1].values[1].value) == Callable \
            and type(tree.values[1]) == Permission and tree.values[1].name == "users.view_user"

    def test_expression_ambiguity(self, parse):
        expression = """
            permission:users.view_user and group:Admin
            and function and callable:function and function:arg and callable:function:arg 
            and callable and permission and group and callables and permissions and groups
            and permissions:arg and groups:arg and callables:arg
            and callable:permission:arg and callable:permissions:arg 
            and callable:group:arg and callable:groups:arg
            and callable:callable:arg and callable:callables:arg
        """
        parsed = parse(expression)
        x = parsed.values

        assert type(parsed) == And \
            and type(x[0]) == Permission and x[0].name == "users.view_user" \
            and type(x[1]) == Group and x[1].name == "Admin" \
            and type(x[2]) == Callable and x[2].name == "function" \
            and type(x[3]) == Callable and x[3].name == "function" \
            and type(x[4]) == Callable and x[4].name == "function" and x[4].args == ["arg"] \
            and type(x[5]) == Callable and x[5].name == "function" and x[5].args == ["arg"] \
            and type(x[6]) == Callable and x[6].name == "callable" \
            and type(x[7]) == Callable and x[7].name == "permission" \
            and type(x[8]) == Callable and x[8].name == "group" \
            and type(x[9]) == Callable and x[9].name == "callables" \
            and type(x[10]) == Callable and x[10].name == "permissions" \
            and type(x[11]) == Callable and x[11].name == "groups" \
            and type(x[10]) == Callable and x[12].name == "permissions" and x[12].args == ["arg"] \
            and type(x[11]) == Callable and x[13].name == "groups" and x[13].args == ["arg"] \
            and type(x[12]) == Callable and x[14].name == "callables" and x[14].args == ["arg"] \
            and type(x[12]) == Callable and x[15].name == "permission" and x[15].args == ["arg"] \
            and type(x[13]) == Callable and x[16].name == "permissions" and x[16].args == ["arg"] \
            and type(x[14]) == Callable and x[17].name == "group" and x[17].args == ["arg"] \
            and type(x[15]) == Callable and x[18].name == "groups" and x[18].args == ["arg"] \
            and type(x[16]) == Callable and x[19].name == "callable" and x[19].args == ["arg"] \
            and type(x[17]) == Callable and x[20].name == "callables" and x[20].args == ["arg"]
