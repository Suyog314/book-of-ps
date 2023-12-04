import "./ImgPreview.scss";

interface IImgUploadProps {
  // handleImgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  src: string;
}

export const ImgPreview = (props: IImgUploadProps) => {
  const { src } = props;

  return (
    <label htmlFor="photo-upload" className="custom-file-upload fas">
      <div className="img-wrap img-upload">
        <img src={src} alt="profile-picture" />
      </div>
      {/* <input id="photo-upload" type="file" onChange={handleImgUpload} /> */}
    </label>
  );
};
