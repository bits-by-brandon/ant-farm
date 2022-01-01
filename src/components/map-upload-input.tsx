import { ChangeEvent } from "react";
import ImageHelper from "../lib/image-helper";

export interface MapUploadProps {
  id: string;
  label: string;
  disabled: boolean;
  onUpload: (mapBuffer: ArrayBuffer, width: number, height: number) => void;
}
export default function MapUploadInput({
  id,
  label,
  disabled,
  onUpload,
}: MapUploadProps) {
  async function handleOnLoad(imageSrc: any) {
    if (typeof imageSrc !== "string") throw new Error("No map file found");
    const { buffer, width, height } = await ImageHelper.imageUrlToBuffer(
      imageSrc
    );
    onUpload(buffer, width, height);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    if (!input.files) return;

    const reader = new FileReader();
    reader.onload = () => handleOnLoad(reader.result);
    reader.readAsDataURL(input.files[0]);
  }

  return (
    <div className="control__container control__container--file">
      <label htmlFor={id}>{label}</label>
      <input id={id} disabled={disabled} type="file" onChange={handleChange} />
    </div>
  );
}
