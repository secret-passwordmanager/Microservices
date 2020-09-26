using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

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
            services.AddScoped<ICredentialService, CredentialService>();
            services.AddScoped<IJwtMiddlewareService, JwtMiddlewareService>();

            /* Grab settings for the Auth Server from appsettings.json */
            var authServerConfig = Configuration.GetSection("Services").GetSection("AuthServer");
           
            /* Configure jwt authentication */
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                /* Get the JWK from our Auth Server */
                var JwkGetter = new JwkGetter(authServerConfig.GetSection("Url").Value);
                JsonWebKey jwk = JwkGetter.getJwK().Result;

                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = jwk,
                    ValidateIssuer = true,
                    ValidIssuer = "BOUNCER",
                    ValidateAudience = false
                };
                x.Events = new JwtBearerEvents
                {

                    
                    OnTokenValidated = context =>
                    {
                        // return unauthorized if user no longer exists
                        var userService = context.HttpContext.RequestServices.GetRequiredService<IUserService>();
                        var userId = int.Parse(context.Principal.Identity.Name);
                        var user = userService.Read(userId);
                        if (user == null)
                        {
                            Console.WriteLine("or fail here");
                            context.Fail("Unauthorized");
                        }
                        /* Check if token has been blacklisted */
                        
                        var jwtService = context.HttpContext.RequestServices.GetRequiredService<IJwtMiddlewareService>();
                        if (jwtService.Read(userId, context.Principal.FindFirstValue("loginId"))) {
                            Console.WriteLine("fail here");
                            context.Fail("Unauthorized");
                        }
                        return Task.CompletedTask;
                    }
                };
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, DatabaseContext Context)
        {
            /* Wait for database to be up */
            var initialized = false;
            while (!initialized) {
                try {
                    // migrate any database changes on startup
                    Context.Database.Migrate();
                    initialized = true;
                } catch {
                    Console.WriteLine("Database inaccessible... pausing for 2 secs...");
                    System.Threading.Thread.Sleep(2000);
                }
            }

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints => endpoints.MapControllers());
            // global cors policy
            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader());

            
        }
    }
}
