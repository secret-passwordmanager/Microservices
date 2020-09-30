using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

using dotnetapi.Entities;
using dotnetapi.Helpers;
using dotnetapi.Models.Credentials;
using dotnetapi.Services;

namespace dotnetapi.Controllers 
{
    
    [ApiController]
    [Route("[controller]")]
    public class CredentialController : ControllerBase
    {
        private ICredentialService _credService;
        private IUserService _userService;
        private IMapper _mapper;

        public CredentialController(ICredentialService credService, IUserService userService, IMapper mapper)
        {
            _userService = userService;
            _credService = credService;
            _mapper = mapper;
        }
        [Authorize(Roles="Trusted")]
        [HttpPost("new")]
        public IActionResult New([FromBody]CredentialCreateModel model) 
        {
            User user = _userService.Read(int.Parse(User.Identity.Name));   
            Credential cred = _mapper.Map<Credential>(model);
            cred.UserId = user.Id;   
            try {
                _credService.Create(cred, user, model.MasterCred, model.Value);
                return Ok();
            }
            catch (AppException e) {
                return BadRequest(new {Title = e.Message});
            }
        }
        [Authorize(Roles="Trusted,Untrusted")]
        [HttpGet]
        public IActionResult Read([FromQuery]CredentialReadModel model)
        {
            int userId = int.Parse(User.Identity.Name); 
            Credential cred = _mapper.Map<Credential>(model);
            cred.UserId = userId;
            var credentials = _mapper.Map<List<CredentialReadModel>>(_credService.Read(cred));
            return Ok(credentials);
        }
        [Authorize(Roles="Trusted")]
        [HttpPost("")]
        public IActionResult Update([FromBody]CredentialUpdateModel model)
        {
            int userId = int.Parse(User.Identity.Name);
            Credential cred = _mapper.Map<Credential>(model);
            cred.UserId = userId;
            try {
                _credService.Update(cred);
                return Ok();
            }
            catch (AppException e) {
                return BadRequest(new {Title = e.Message});
            }
        }
         [Authorize(Roles="Trusted")]
         [HttpGet("decrypt")]
         public IActionResult Decrypt([FromQuery] CredentialDecryptModel model) {

            User user = _userService.Read(int.Parse(User.Identity.Name));   
            Credential cred = _mapper.Map<Credential>(model);
            cred.UserId = user.Id;   
            try {
                return Ok(new {credVal = _credService.Decrypt(cred, user, model.MasterCred)});
                
            }
            catch (AppException e) {
                return BadRequest(new {Title = e.Message});
            }
         }


        [Authorize(Roles="Trusted")]
        [HttpDelete]
        public IActionResult Delete([FromBody]CredentialDeleteModel model)
        {  
            int userId = int.Parse(User.Identity.Name);
            Credential cred = _mapper.Map<Credential>(model);
            cred.UserId = userId;
            try {
                _credService.Delete(cred);
                return Ok();
            }
            catch (AppException e) {
                return BadRequest(new {Title = e.Message});
            }
        }
    }
}

