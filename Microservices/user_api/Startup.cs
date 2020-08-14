using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Threading.Tasks;
using System.Text;
using System.Xml;
using System.Security.Cryptography;

using dotnetapi.Helpers;
using dotnetapi.Services;
using dotnetapi.Entities;

namespace dotnetapi
{
    public class Startup
    {
        public Startup(IConfiguration configuration) 
        {
            Configuration = configuration; 
        }
        public IConfiguration Configuration { get; }
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<DatabaseContext>();
            services.AddMvcCore().AddDataAnnotations();
            services.AddCors();
            services.AddControllers();
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            /* These classes will receive a new instance of themselves on each new request */
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ISwapService, SwapService>();
            services.AddScoped<ICredentialService, CredentialService>();
            services.AddScoped<ILogService, LogService>();

            /* configure strongly typed settings objects */
            var microserviceConfigSection = Configuration.GetSection("Services");
            services.Configure<Microservice[]>(microserviceConfigSection);
            var microservicesConfig = microserviceConfigSection.Get<Microservice[]>();
            
            /* Get the JWK from our Auth Server */
            var authServer = Array.Find(microservicesConfig, x => x.Name == "AuthService");
            var JwkGetter = new JwkGetter(authServer.Url);
            JsonWebKey jwk = JwkGetter.getJwK().Result;

            /* Configure jwt authentication */
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var userService = context.HttpContext.RequestServices.GetRequiredService<IUserService>();
                        Console.WriteLine(context.Principal.Identity.Name);
                        var userId = int.Parse(context.Principal.Identity.Name);
                        var user = userService.Read(userId);
                        if (user == null)
                        {
                            // return unauthorized if user no longer exists
                            Console.WriteLine(context.Principal.Identity.Name);
                            context.Fail("Unauthorized");
                        }
                        return Task.CompletedTask;
                    }
                };
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = jwk,
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, DatabaseContext Context)
        {
            // migrate any database changes on startup
            Context.Database.Migrate();

            app.UseRouting();

            // global cors policy
            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader());

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints => endpoints.MapControllers());
        }
    }


}
