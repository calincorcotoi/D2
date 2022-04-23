using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using API.Entities;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(DataContext context)
        {
            var seedUsers = File.ReadAllText(@"Data/UserSeedData.json");
            var users = JsonSerializer.Deserialize<List<AppUser>>(seedUsers);

            foreach (var user in users)
            {
                using var hmac = new HMACSHA512();
                user.UserName = user.UserName .ToLower();
                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("asdasd"));
                user.PasswordSalt = hmac.Key;
                
                context.Users.Add(user);
            }
            await context.SaveChangesAsync();
        }
    }
}