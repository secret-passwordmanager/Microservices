using System.Text;
using System;
using System.Security.Cryptography;
using System.Net.Http;
using System.Threading.Tasks;
namespace dotnetapi.Helpers 
{
	public class JwkGetter 
	{
		public HttpClient Client { get; set; }
		public string PublicKeyString { get; set; }
		public string AuthServerUrl {get; set; }

		public JwkGetter(string serverUrl)
		{
			Client = new HttpClient();
			AuthServerUrl = serverUrl;
		}

		/*
			This is just a helper function just grabs the PEM key 
			from secret_bouncer
		*/
		private async Task<string> getPublicKeyString()
		{
			using var response = await Client.GetAsync(AuthServerUrl, HttpCompletionOption.ResponseHeadersRead);

			response.EnsureSuccessStatusCode();
			try {
				
				return await response.Content.ReadAsStringAsync();

			}
			catch {
				System.Console.WriteLine("Http Response could not be deserialized");
				return "";
			}
		}

		/*
			This function converts the PEM key we get from secret_bouncer 
			into a der key.
		*/
		public byte[] GenerateDer() 
		{
			string pemContents = getPublicKeyString().Result;
			const string RsaSpkiHeader = "-----BEGIN PUBLIC KEY-----";
			const string RsaSpkiFooter = "-----END PUBLIC KEY-----";

			/* Remove the Header and Footers*/
			if (pemContents.StartsWith(RsaSpkiHeader)) {
				int endIdx = pemContents.IndexOf(
					RsaSpkiFooter,
					RsaSpkiHeader.Length,
					StringComparison.Ordinal
				);

				string base64 = pemContents.Substring(
					RsaSpkiHeader.Length,
					endIdx - RsaSpkiHeader.Length
				);
				Console.WriteLine(base64);
				return Convert.FromBase64String(base64);
			}
			throw new InvalidOperationException();
		}
		
	}

}