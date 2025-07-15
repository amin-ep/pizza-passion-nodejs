interface IRequestFiles {
  [fieldname: string]: Express.Multer.File[];
}

type Address = {
  street: string;
  postalCode: string;
  text: string;
};
