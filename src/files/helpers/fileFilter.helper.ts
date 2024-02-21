export const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: Function) => {

    if (!file) return cb(new Error('File not found'), false)

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

    if (validExtensions.includes(fileExtension)) {
        return cb(null, true);
    }

    cb(null, true)
}