def test_settings_load():
    from django.conf import settings
    assert settings.REST_FRAMEWORK["PAGE_SIZE"] == 10
