namespace ChatApp.Application.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string resource, object id)
            : base($"{resource} with id '{id}' was not found.") { }
    }

    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message = "Unauthorized.") : base(message) { }
    }

    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }
}
