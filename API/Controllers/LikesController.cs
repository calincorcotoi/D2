using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class LikesController:BaseApiController
    {
        private readonly ILikesRepository _likesRepository;
        private readonly IUserRepository _userReposity;
        private readonly DataContext _context;
        public LikesController(ILikesRepository likesRepository,IUserRepository userReposity,DataContext context )
        {
            _context = context;
            _userReposity = userReposity;
            _likesRepository = likesRepository;
            
        }

        [HttpPost("{username}")]
        public async Task<ActionResult> AddLike(string username)
        {
            var sourceUserId = User.GetUserId();
            var likedUser = await _userReposity.GetUserByUsernameAsync(username);
            var SourceUser = await _likesRepository.GetUserWithLikes(sourceUserId);

            if(likedUser == null) return NotFound();

            if(SourceUser.UserName == username) return BadRequest("You cannot like yourseld");

            var userlike = await _likesRepository.GetUserLike(sourceUserId, likedUser.Id);

            if(userlike != null) return BadRequest("You already like this user");

            userlike = new UserLike
            {
                SourceUserId = sourceUserId,
                LikedUserId = likedUser.Id
            };

            SourceUser.LikedUsers.Add(userlike);

            if (await _userReposity.SaveAllAsync()) return Ok();

            return BadRequest("Failed to like user");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery]LikesParams likesParams)
        {
            likesParams.UserId= User.GetUserId();
            var users = await _likesRepository.GetUserLikes(likesParams);
            
            Response.AddPaginationHeader(users.CurrentPage, users.PageSize,users.TotalCount, users.TotalPages );

            return Ok(users);
        }

    }
}