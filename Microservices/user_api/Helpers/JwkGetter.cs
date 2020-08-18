using System.Text;
using System;
using Microsoft.IdentityModel.Tokens;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.Extensions.Options;
namespace dotnetapi.Helpers 
{
	public class JwkGetter 
	{
		public HttpClient Client { get; set; }
		public string PublicKeyString { get; set; }
		public string AuthServerUrl { get; set; }

		public JwkGetter(string serverUrl)
		{
			Client = new HttpClient();
			AuthServerUrl = serverUrl;
		}

		/*
			This is just a helper function just grabs the PEM key 
			from secret_bouncer
		*/
		public async Task<JsonWebKey> getJwK()
		{
			
			bool authServerUp = false;
			HttpResponseMessage response;
			while (!authServerUp) {
                try {
                    // migrate any database changes on startup
					response = await Client.GetAsync(AuthServerUrl + "/auth/jwk", HttpCompletionOption.ResponseHeadersRead);
                    response.EnsureSuccessStatusCode();
                    authServerUp = true;
					var jsonString =  await response.Content.ReadAsStringAsync();
					return JsonConvert.DeserializeObject<JsonWebKey>(jsonString);
                } catch {
                    Console.WriteLine("Auth Server inaccessible... pausing for 5 sec...");
                    System.Threading.Thread.Sleep(5000);
                }
            }
			return new JsonWebKey();
		}
	}

}