using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
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

        public UsersController(IUserRepository userReposity, IMapper mapper)
        {
            _mapper = mapper;
            _userReposity = userReposity;
            
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetMembers()
        {
            return Ok(await _userReposity.GetMembersAsync());
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetAppUser(string username)
        {
            return await _userReposity.GetMemberAsync(username);

        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var user = await _userReposity.GetUserByUsernameAsync(username);

            _mapper.Map(memberUpdateDto,user);

            _userReposity.Upadate(user);

            if(await _userReposity.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update the user");
        }
    }
}