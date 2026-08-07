from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    rate = "10/min"


class UserWriteRateThrottle(UserRateThrottle):
    rate = "60/min"


class UploadRateThrottle(UserRateThrottle):
    rate = "20/min"
