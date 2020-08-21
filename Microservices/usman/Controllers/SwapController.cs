using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

using dotnetapi.Entities;
using dotnetapi.Services;
using dotnetapi.Helpers;
using dotnetapi.Models.Requests;

namespace dotnetapi.Controllers
{
    [Authorize(Roles="Trusted")]
    [ApiController]
    [Route("[controller]")]
    
    public class SwapController : ControllerBase
    {
        private ISwapService _swapService;
        private ICredentialService _credService;
        private IUserService _userService;
        private IMapper _mapper;
    
        public SwapController(ISwapService swapService, ICredentialService credService, IUserService userService, IMapper mapper)
        {
            _swapService = swapService;
            _credService = credService;
            _userService = userService;
            _mapper = mapper;
        }
        
        ////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Request Methods //////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////
        [HttpPost("new")]
        public IActionResult New([FromBody] SubmitRequestSwapModel model)
        {
            int userId = int.Parse(User.Identity.Name);
            var ReqSwap = _mapper.Map<RequestSwap>(model);
            
            ReqSwap.UserId = userId; 
            //ReqSwap.Ip = "192.168.1.3";
            ReqSwap.Ip = Request.HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            Console.Write(ReqSwap.Ip);
            
            _swapService.Enqueue(ReqSwap);
            
            return Ok();
        }

        [HttpGet]
        public IActionResult GetHead()
        {
            var userId = int.Parse(User.Identity.Name);
            var reqSwap = _swapService.Front(userId);
            return Ok(_mapper.Map<ReadSwapModel>(reqSwap));
        }

        [HttpDelete]
        public IActionResult Pop()
        {
            var userId = int.Parse(User.Identity.Name);
            try {
                _swapService.Dequeue(userId);
                return Ok();
            }
            catch(AppException e) {
                return BadRequest(new { Title = e.Message });
            }
        }

        [HttpPost] 
        public IActionResult Submit([FromBody]SubmitSwapModel model)
        {
            /* Grab the user */
            User user = _userService.Read(int.Parse(User.Identity.Name));

            /* Grab the top request Swap */
            RequestSwap reqSwap = _swapService.Front(user.Id);
            if (reqSwap == null) {
                return BadRequest(new {Title = "User does not have any pending request Swaps"});
            }

            /* Grab the credential by Id */
            Credential cred = new Credential();
            cred.Id = model.CredentialId;
            cred.UserId = user.Id;
            Console.Write("user id: " + user.Id);
            cred.Domain = reqSwap.Domain;
            cred = _credService.Read(cred)[0];

            /* Make sure user is allowed to use credential on this domain */
            if (cred == null) {
                return BadRequest(new {Title = "User is not allowed to use this credential on this domain"});
            }


            /* Convert masterCred into PKBDF2 */
            byte[] masterPkbdf2 = KeyDerivation.Pbkdf2(
                password: model.MasterCred,
                salt: user.MasterCredSalt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8
            );


            /* Decrypt the aes key using hashed masterCred */
            byte[] masterKey;
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = masterPkbdf2;
                aes.IV = user.MasterCredIV;
                
                using (var cryptoTransform = aes.CreateDecryptor()) {
                    masterKey = cryptoTransform.TransformFinalBlock(user.MasterKeyAesEnc, 0, user.MasterKeyAesEnc.Length);
                }
            }


            /* Decrypt the credential using the masterKey */
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = masterKey;
                aes.IV = cred.AesIV;
                Console.WriteLine("credValue: " + cred.AesValue);
                using (var cryptoTransform = aes.CreateDecryptor()) {
                    byte[] credVal = cryptoTransform.TransformFinalBlock(cred.AesValue, 0, cred.AesValue.Length);
                    Console.WriteLine("CredVal: "+ Encoding.ASCII.GetString(credVal, 0, credVal.Length));
                    _swapService.Swap(user.Id, Encoding.ASCII.GetString(credVal, 0, credVal.Length));
                }
            }

            return Ok();
        }

    }
}
