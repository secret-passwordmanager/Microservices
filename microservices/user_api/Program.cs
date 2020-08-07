using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace dotnetapi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseUrls("https://*:8081", "http://*:8080"); //TODO: Remove this line
                    webBuilder.UseStartup<Startup>(); 
                });
    }
}
