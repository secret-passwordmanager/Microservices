using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


using dotnetapi.Services;
using dotnetapi.Entities;
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
        private IJwtService _jwtService;

        public InternalController(IMapper mapper, IJwtService jwtService)
        {
            _mapper = mapper;
            _jwtService = jwtService;
        }

        [AllowAnonymous]
        [HttpPost("blacklistjwt")]
        public IActionResult BlacklistJwt([FromBody] BlacklistJwtModel model)
        {
            string refreshToken = model.RefreshToken;
            _jwtService.Create(refreshToken);
            
            return Ok();

        }
    }

}