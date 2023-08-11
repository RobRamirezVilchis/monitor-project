from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers

User = get_user_model()


class CommonUserSerializer(serializers.ModelSerializer):
    extra = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "extra"]
        read_only_fields = ["id", "email", "first_name", "last_name", "extra"]

    def get_extra(self, obj):
        try:
            # social_account = SocialAccount.objects.get(user=obj, provider="google")
            social_account = obj.socialaccount_set.all()[0]
            return {
                "picture": social_account.extra_data["picture"],
            }
        except:
            return None
