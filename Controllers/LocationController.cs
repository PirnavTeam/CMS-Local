using AuthDemo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;


[ApiController]

[Route("api/[controller]")]
public class LocationController : ControllerBase
{

    private readonly AppDbContext _context;


    public LocationController(AppDbContext context)

    {

        _context = context;

    }



    [HttpGet("pincode/{pincode}")]

    public async Task<IActionResult> GetLocation(string pincode)

    {

        using var client = new HttpClient();


        var response =

            await client.GetStringAsync(

                $"https://api.postalpincode.in/pincode/{pincode}");


        return Content(

            response,

            "application/json");

    }

}