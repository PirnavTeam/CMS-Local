//using Microsoft.AspNetCore.Http;

//namespace AuthDemo.Helpers;

//public static class FileHelper
//{
//    // =====================================================
//    // SAVE IMAGE
//    // =====================================================

//    public static async Task<string?>
//        SaveImageAsync(
//            IFormFile? file,
//            string rootPath)
//    {
//        // =================================================
//        // NULL CHECK
//        // =================================================

//        if (file == null)
//        {
//            return null;
//        }

//        // =================================================
//        // CREATE FOLDER
//        // =================================================

//        var uploadFolder =
//            Path.Combine(
//                rootPath,
//                "uploads"
//            );

//        if (!Directory.Exists(
//                uploadFolder))
//        {
//            Directory.CreateDirectory(
//                uploadFolder
//            );
//        }

//        // =================================================
//        // FILE NAME
//        // =================================================

//        var fileName =
//            $"{Guid.NewGuid()}_{file.FileName}";

//        var filePath =
//            Path.Combine(
//                uploadFolder,
//                fileName
//            );

//        // =================================================
//        // SAVE FILE
//        // =================================================

//        using (var stream =
//            new FileStream(
//                filePath,
//                FileMode.Create
//            ))
//        {
//            await file.CopyToAsync(
//                stream
//            );
//        }

//        // =================================================
//        // RETURN URL
//        // =================================================

//        return
//            $"/uploads/{fileName}";
//    }
//}


using Microsoft.AspNetCore.Http;

namespace AuthDemo.Helpers;

public static class FileHelper
{
    public static async Task<string?> SaveImageAsync(
        IFormFile? file,
        string folderName)
    {
        if (file == null)
            return null;

        var uploadFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            folderName
        );

        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        var extension = Path.GetExtension(file.FileName);

        var fileName = $"{Guid.NewGuid()}{extension}";

        var filePath = Path.Combine(
            uploadFolder,
            fileName
        );

        using (var stream = new FileStream(
            filePath,
            FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/{folderName}/{fileName}";
    }
}