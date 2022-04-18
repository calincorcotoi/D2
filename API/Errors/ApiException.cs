using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Errors
{
    public class ApiException
    {
        public ApiException(int statudCode, string message = null, string details = null)
        {
            StatudCode = statudCode;
            Message = message;
            Details = details;
        }

        public int StatudCode { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }
    }
}