using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


using dotnetapi.Services;
using dotnetapi.Models.Internal;
using dotnetapi.Helpers;

namespace WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class InternalController : ControllerBase
    {

        private IMapper _mapper;
        private IJwtMiddlewareService _jwtService;

        public InternalController(IMapper mapper, IJwtMiddlewareService jwtService)
        {
            _mapper = mapper;
            _jwtService = jwtService;
        }

        [AllowAnonymous]
        [HttpPost("blacklistjwt")]
        public IActionResult BlacklistJwt([FromBody] BlacklistJwtModel model)
        {
            _jwtService.Create(model.UserId, model.LoginId);
            return Ok();
        }
    }
}