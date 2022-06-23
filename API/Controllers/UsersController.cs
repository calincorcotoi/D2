using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{

    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userReposity;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public UsersController(IUserRepository userReposity, IMapper mapper, IPhotoService photoService)
        {
            _photoService = photoService;
            _mapper = mapper;
            _userReposity = userReposity;
            
        }
        
        [Authorize(Roles = "Member")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetMembers([FromQuery]UserParams userParams)
        {
            var user  = await _userReposity.GetUserByUsernameAsync(User.GetUsername());
            userParams.CurrentUsername = user.UserName;

            if(string.IsNullOrEmpty(userParams.Gender))
                userParams.Gender = user.Gender == "male" ? "female" : "male";

            var users = await _userReposity.GetMembersAsync(userParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize,users.TotalCount, users.TotalPages );

            return Ok(users);
        }

        [Authorize(Roles = "Member")]
        [HttpGet("{username}", Name ="GetAppUser")]
        public async Task<ActionResult<MemberDto>> GetAppUser(string username)
        {
            return await _userReposity.GetMemberAsync(username);

        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            // var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var username = User.GetUsername();

            var user = await _userReposity.GetUserByUsernameAsync(username);

            _mapper.Map(memberUpdateDto,user);

            _userReposity.Upadate(user);

            if(await _userReposity.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update the user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            if(file == null) return BadRequest("Please add a photo.");

            var username = User.GetUsername();

            var user = await _userReposity.GetUserByUsernameAsync(username);

            var result = await _photoService.AddPhotoAsync(file);

            if(result.Error != null) return BadRequest(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            if(user.Photos.Count == 0)
            {
                photo.IsMain = true;
            }

            user.Photos.Add(photo);

            if(await _userReposity.SaveAllAsync())
                return CreatedAtRoute("GetAppUser",new{username = username},_mapper.Map<PhotoDto>(photo));
    
            return BadRequest("Problem adding photo");
        } 

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _userReposity.GetUserByUsernameAsync(User.GetUsername());

            var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

            var currentMainPhoto = user.Photos.FirstOrDefault( p => p.IsMain == true);

            if(currentMainPhoto != null) currentMainPhoto.IsMain = false;

            photo.IsMain = true;

            if(await _userReposity.SaveAllAsync()) return NoContent();

            return BadRequest("Something bad happend when setting the main photo.");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await _userReposity.GetUserByUsernameAsync(User.GetUsername());

            var photoToDelete = user.Photos.FirstOrDefault(p => p.Id == photoId);

            if(photoToDelete.IsMain) return BadRequest("Can not delete main photo.");

            if(photoToDelete != null)
            {
                var result = await _photoService.DeletePhotoAsync(photoToDelete.PublicId);

                if (result.Error != null) return BadRequest(result.Error.Message);               

                user.Photos.Remove(photoToDelete);

                if(await _userReposity.SaveAllAsync()) return NoContent();
            }
            
            return BadRequest("Something bad happend when deleting the photo.");
        }

    }
}