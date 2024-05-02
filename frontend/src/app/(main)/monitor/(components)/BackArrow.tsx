import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackArrow = () => {
  const router = useRouter();

  return (
    <button
      className="absolute hidden lg:block right-full mr-5 mt-2 opacity-40"
      onClick={() => router.back()}
    >
      <ArrowBackIcon />
    </button>
  );
};

export default BackArrow;
