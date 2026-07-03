import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.test")

import django
from django.conf import settings

# Setup Django before pytest-django initialization
if not settings.configured:
    django.setup()

pytest_plugins = "pytest_django"
