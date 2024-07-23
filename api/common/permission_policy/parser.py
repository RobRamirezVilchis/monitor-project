from abc import abstractmethod
from django.conf import settings
from django.contrib.auth.models import Group as DjangoGroup
from lark import Lark, Transformer
from typing import Iterable


"""
    Precedence (lowest to highest):
    0. permission, group, callable
    1. or
    2. and
    3. not
    4. (exp...)
"""

basic_parser_grammar = r"""
    ?exp: or_exp
    ?or_exp: and_exp ("or" and_exp)*
    ?and_exp: primary ("and" primary)*
    ?primary: not_exp | atom
    not_exp: "not" primary
    ?atom: value | "(" exp ")"
    ?value: "permission:" permission
          | "group:" group
          | callable
    permission: STRING
    group: STRING
    callable: "callable:"? c_name (":" c_arg)*
    c_name: STRING
    c_arg: NUMBER | BOOL | STRING | ESCAPED_STRING

    BOOL: "true"i | "false"i
    STRING: /[\w.]+/
                         
    %import common.ESCAPED_STRING
    %import common.SIGNED_NUMBER  -> NUMBER
    %import common.WS
    %ignore WS
"""

lalr_parser_grammar = r"""
    ?exp: or_exp
    ?or_exp: and_exp ("or" and_exp)*
    ?and_exp: primary ("and" primary)*
    ?primary: not_exp | atom
    not_exp: "not" primary
    ?atom: value | "(" exp ")"
    ?value: "permission:" permission
          | "group:" group
          | callable
    permission: STRING
    group: STRING
    callable: "callable:" c_name (":" c_arg)* 
            |  c_name_restricted (":" c_arg)*
    c_name: STRING
    c_name_restricted: RESTRICTED_STRING
    c_arg: NUMBER | BOOL | STRING | ESCAPED_STRING

    BOOL.1: "true"i | "false"i
    RESTRICTED_STRING: /(?!(permission|group|callable)[^\w\s])[\w.]+/
    STRING: /[\w.]+/
                         
    %import common.ESCAPED_STRING
    %import common.SIGNED_NUMBER  -> NUMBER
    %import common.WS
    %ignore WS
"""


class ExpressionTransformer(Transformer):

    def exp(self, items):
        return items

    def or_exp(self, items):
        return Or(items)

    def and_exp(self, items):
        return And(items)

    def not_exp(self, items):
        return Not(items[0])

    def value(self, items):
        return items[0]

    def group(self, items):
        return Group(items[0])

    def permission(self, items):
        return Permission(items[0])

    def callable(self, items):
        return Callable(items[0], items[1:])

    def c_name_restricted(self, items):
        return items[0]

    def c_name(self, items):
        return items[0]

    def c_arg(self, items):
        return items[0]

    def BOOL(self, value):
        if str(value).upper() == "TRUE":
            return True
        else:
            return False

    def RESTRICTED_STRING(self, value):
        return str(value)

    def STRING(self, value):
        return str(value)

    def ESCAPED_STRING(self, value):
        return str(value).strip('"')

    def NUMBER(self, value):
        try:
            return int(value)
        except ValueError:
            return float(value)


basic_expression_parser = Lark(basic_parser_grammar, start="exp")
lalr_expression_parser = Lark(
    lalr_parser_grammar, start="exp", parser="lalr", transformer=ExpressionTransformer())


class Rule:
    @abstractmethod
    def eval(self, policy, request, view, action, method, obj=None) -> bool:
        raise NotImplementedError


class And(Rule):
    def __init__(self, values: Iterable[Rule]):
        self.values = values

    def __str__(self):
        return "(" + " & ".join(str(x) for x in self.values) + ")"

    def __repr__(self):
        return "(" + " & ".join(str(x) for x in self.values) + ")"

    def eval(self, policy, request, view, action, method, obj=None) -> bool:
        return all(x.eval(policy, request, view, action, method, obj) for x in self.values)


class Or(Rule):
    def __init__(self, values: Iterable[Rule]):
        self.values = values

    def __str__(self):
        return "(" + " | ".join(str(x) for x in self.values) + ")"

    def __repr__(self):
        return "(" + " | ".join(str(x) for x in self.values) + ")"

    def eval(self, policy, request, view, action, method, obj=None) -> bool:
        return any(x.eval(policy, request, view, action, method, obj) for x in self.values)


class Not(Rule):
    def __init__(self, value: Rule):
        self.value = value

    def __str__(self):
        return f"!{str(self.value)}"

    def __repr__(self):
        return f"!{str(self.value)}"

    def eval(self, policy, request, view, action, method, obj=None) -> bool:
        return not self.value.eval(policy, request, view, action, method, obj)


class Permission(Rule):
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"permission:{self.name}"

    def __repr__(self):
        return f"permission:{self.name}"

    def eval(self, policy, request, view, action, method, obj=None) -> bool:
        print(f"Has {self.name} permission: ",
              request.user.has_perm(self.name, obj))
        if obj and policy.obj_permission_checker:
            return policy.obj_permission_checker.has_perm(self.name, obj)
        return request.user.has_perm(self.name, obj)


class Group(Rule):
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"group:{self.name}"

    def __repr__(self):
        return f"group:{self.name}"

    def eval(self, policy, request, view, action, method, obj=None) -> bool:
        if "groups" not in policy.cache:
            policy.cache["groups"] = request.user.groups.all()
        return any(x.name == self.name for x in policy.cache.get("groups", []))


class Callable(Rule):
    def __init__(self, name, args):
        self.name = name
        self.args = args

    def __str__(self):
        return f"callable:{self.name}:{self.args}"

    def __repr__(self):
        return f"callable:{self.name}:{self.args}"

    def eval(self, policy, request, view, action, method, obj=None) -> bool:
        try:
            callable = getattr(policy, self.name)
            return callable(request, view, action, obj, *self.args)
        except AttributeError:
            if not hasattr(settings, "PERMISSION_POLICY_GLOBALS"):
                raise AttributeError(
                    f"Callable '{self.name}' not found in '{policy.__class__.__name__}'")
        try:
            callable = getattr(settings.PERMISSION_POLICY_GLOBALS, self.name)
            return callable(policy, request, view, action, obj, *self.args)
        except AttributeError:
            raise AttributeError(
                f"Callable '{self.name}' not found in '{policy.__class__.__name__}' or '{settings.PERMISSION_POLICY_GLOBALS.__name__}'")
