using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

using dotnetapi.Services;
using dotnetapi.Entities;
using dotnetapi.Models.Users;
using dotnetapi.Helpers;

namespace dotnetapi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private IUserService _userService;
        private IMapper _mapper;


        public UserController(IUserService userService, IMapper mapper)
        {
            _userService = userService;
            _mapper = mapper;
        }

        [AllowAnonymous]
        [HttpPost("verify")]
        public IActionResult Verify([FromBody]UserAuthenticateModel model)
        {
            var user = _userService.Authenticate(model);
            if (user == null)
                return BadRequest(new { message = "Username or password is incorrect" });

            return Ok(user.Id);
        }

        [AllowAnonymous]
        [HttpPost("new")]
        public IActionResult New([FromBody]UserCreateModel model)
        {
            try
            {
                var user = _mapper.Map<User>(model);
                _userService.Create(_mapper.Map<User>(model), model.Password, model.MasterCred, "User");
                return Ok();
            }
            catch (AppException ex)
            {
                return BadRequest(new { Title = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult Read()
        {
            var currentUserId = int.Parse(User.Identity.Name);
            var user =  _userService.Read(currentUserId);            
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost]
        public IActionResult Update([FromBody]UserUpdateModel model)
        {   
            model.Id = int.Parse(User.Identity.Name);

            try {
                _userService.Update(_mapper.Map<User>(model), model.Password);
                return Ok();
            }
            catch (AppException ex) {
                return BadRequest(new { Title = ex.Message });
            }
        }
    }
}
