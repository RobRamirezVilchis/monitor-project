class ApplicationError(Exception):
    default_code = "application_error"

    def __init__(self, detail, code=None, extra=None):
        super().__init__(detail)

        self.detail = detail
        self.code = code if code is not None else self.default_code
        self.extra = extra or {}