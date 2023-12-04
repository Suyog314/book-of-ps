import "./ImgUpload.scss";

interface IImgUploadProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  src: string;
}

export const ImgUpload = (props: IImgUploadProps) => {
  const { onChange, src } = props;

  return (
    <label htmlFor="photo-upload" className="custom-file-upload fas">
      <div className="img-wrap img-upload">
        <img src={src} alt="profile-picture" />
      </div>
      <input id="photo-upload" type="file" onChange={onChange} />
    </label>
  );
};
