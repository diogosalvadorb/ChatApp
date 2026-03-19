using ChatApp.API.Helpers;
using ChatApp.Domain.Ports.In;
using ChatMVP.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static ChatApp.Application.DTOs.ContactDTOs;

namespace ChatApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly IContactUseCases _contactUseCases;
        public ContactsController(IContactUseCases contactUseCases)
        {
            _contactUseCases = contactUseCases;
        }

        [HttpGet]
        public async Task<IActionResult> GetContacts()
        {
            var userId = MessageHelpers.GetCurrentUserId(User);
            var contacts = await _contactUseCases.GetContactsAsync(userId);
            return Ok(contacts);
        }

        [HttpPost("request")]
        public async Task<IActionResult> SendRequest([FromBody] SendContactRequestDto dto)
        {
            var requesterId = MessageHelpers.GetCurrentUserId(User);
            var request = await _contactUseCases.SendRequestAsync(requesterId, dto.AddresseeEmail);

            return Created(string.Empty, ContactHelpers.ToResponse(request));
        }

        [HttpPatch("{requestId}/accept")]
        public async Task<IActionResult> Accept(Guid requestId)
        {
            var userId = MessageHelpers.GetCurrentUserId(User);
            var request = await _contactUseCases.AcceptRequestAsync(requestId, userId);
            return Ok(ContactHelpers.ToResponse(request));
        }

        [HttpPatch("{requestId}/reject")]
        public async Task<IActionResult> Reject(Guid requestId)
        {
            var userId = MessageHelpers.GetCurrentUserId(User);
            var request = await _contactUseCases.RejectRequestAsync(requestId, userId);
            return Ok(ContactHelpers.ToResponse(request));
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var userId = MessageHelpers.GetCurrentUserId(User);
            var pending = await _contactUseCases.GetPendingRequestsAsync(userId);
            return Ok(pending.Select(ContactHelpers.ToResponse));
        }
    }
}
