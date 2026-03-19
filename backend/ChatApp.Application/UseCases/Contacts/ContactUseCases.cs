using ChatApp.Application.Exceptions;
using ChatApp.Domain.Entities;
using ChatApp.Domain.Ports.In;
using ChatApp.Domain.Ports.Out.Persistence;

namespace ChatApp.Application.UseCases.Contacts
{
    public class ContactUseCases : IContactUseCases
    {
        private readonly IContactRepository _contactRepository;
        private readonly IUserRepository _userRepository;

        public ContactUseCases(
            IContactRepository contactRepository,
            IUserRepository userRepository)
        {
            _contactRepository = contactRepository;
            _userRepository = userRepository;
        }

        public async Task<Contact> SendRequestAsync(Guid requesterId, string addresseeEmail)
        {
            var requester = await _userRepository.FindByIdAsync(requesterId)
                ?? throw new NotFoundException(nameof(User), requesterId);

            var addressee = await _userRepository.FindByEmailAsync(addresseeEmail)
                ?? throw new NotFoundException(nameof(User), addresseeEmail);

            if (await _contactRepository.AreContactsAsync(requesterId, addressee.Id))
                throw new ConflictException("You are already contacts.");

            var existing = await _contactRepository.FindPendingBetweenAsync(requesterId, addressee.Id);

            if (existing is not null)
                throw new ConflictException("A pending request already exists between these users.");

            var request = new Contact(requester.Id, addressee.Id);

            await _contactRepository.SaveAsync(request);

            return request;
        }

        public async Task<Contact> AcceptRequestAsync(Guid requestId, Guid addresseeId)
        {
            var request = await _contactRepository.FindByIdAsync(requestId)
                ?? throw new NotFoundException(nameof(Contact), requestId);

            if (request.AddresseeId != addresseeId)
                throw new UnauthorizedException("Only the addressee can accept this request.");

            request.Accept();

            await _contactRepository.UpdateAsync(request);

            return request;
        }

        public async Task<Contact> RejectRequestAsync(
            Guid requestId, Guid addresseeId)
        {
            var request = await _contactRepository.FindByIdAsync(requestId)
                ?? throw new NotFoundException(nameof(Contact), requestId);

            if (request.AddresseeId != addresseeId)
                throw new UnauthorizedException("Only the addressee can reject this request.");

            request.Reject();

            await _contactRepository.UpdateAsync(request);

            return request;
        }

        public async Task<IEnumerable<Contact>> GetContactsAsync(Guid userId)
        {
            var user = await _userRepository.FindByIdAsync(userId)
                ?? throw new NotFoundException(nameof(User), userId);

            var accepted = await _contactRepository.FindAcceptedByUserAsync(user.Id);

            return accepted.Select(r =>
            {
                var isRequester = r.RequesterId == userId;

                var other = isRequester ? r.Addressee! : r.Requester!;

                return new Contact(other.Id, other.Name, other.Email, r.RespondedAt!.Value);
            });
        }

        public async Task<IEnumerable<Contact>> GetPendingRequestsAsync(Guid userId)
        {
            var user = await _userRepository.FindByIdAsync(userId)
                ?? throw new NotFoundException(nameof(User), userId);

            return await _contactRepository.FindPendingAddressedToAsync(user.Id);
        }
    }
}
