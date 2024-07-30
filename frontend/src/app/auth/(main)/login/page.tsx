import { Divider } from "@mantine/core";
import { LoginForm } from "./LoginForm";
import SocialProviders from "./SocialProviders";
import Link from "next/link";
import Introid from "../../../../media/introid.png";
import Image from "next/image";
import clsx from "clsx";
import fonts from "@/ui/fonts";

const Login = () => {
  return (
    <div className={clsx(fonts.ubuntu.className, "rounded-lg shadow-xl")}>
      <div className="rounded-t-lg bg-neutral-100 relative pt-6 flex flex-col items-center justify-center pb-10">
        <Image
          src={Introid}
          width={250}
          height={60}
          alt="Picture of the author"
        ></Image>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="221"
          height="63"
          fill="none"
          className=" scale-50 absolute top-14"
        >
          <path
            fill="#010101"
            d="M102.848 51.074c-3.353.074-6.612-1.163-9.153-3.474-2.253-2.035-3.775-4.827-4.31-7.907a15.687 15.687 0 0 1 1.003-9.437 13.442 13.442 0 0 1 3.75-5.124 12.49 12.49 0 0 1 5.577-2.692c3.13-.763 6.413-.369 9.302 1.116a12.938 12.938 0 0 1 4.602 3.813 13.864 13.864 0 0 1 2.518 5.578c.817 3.32.509 6.838-.873 9.944a13.622 13.622 0 0 1-3.557 4.936 12.695 12.695 0 0 1-5.256 2.768 14.842 14.842 0 0 1-3.603.48Zm-6.387-14.386c0 .185 0 .424.052.673a6.99 6.99 0 0 0 1.544 3.963 6.063 6.063 0 0 0 2.398 1.831 5.745 5.745 0 0 0 2.934.408 5.66 5.66 0 0 0 3.128-1.14 6.153 6.153 0 0 0 2.046-2.749 7.882 7.882 0 0 0-.105-6.45 5.977 5.977 0 0 0-2.687-2.94 5.963 5.963 0 0 0-2.618-.72 5.807 5.807 0 0 0-2.376.328 6.037 6.037 0 0 0-2.074 1.267 7.145 7.145 0 0 0-1.7 2.503 7.494 7.494 0 0 0-.542 3.026ZM201.795 26.274c0-.778.219-1.538.629-2.184a3.77 3.77 0 0 1 1.674-1.446 3.532 3.532 0 0 1 2.152-.217 3.665 3.665 0 0 1 1.903 1.085 4 4 0 0 1 1.009 2.02 4.132 4.132 0 0 1-.226 2.27 3.884 3.884 0 0 1-1.384 1.755 3.576 3.576 0 0 1-2.075.643c-.486 0-.968-.101-1.417-.3a3.685 3.685 0 0 1-1.199-.852 3.92 3.92 0 0 1-.796-1.274 4.073 4.073 0 0 1-.27-1.5Zm.628 0a3.398 3.398 0 0 0 .509 1.822c.337.54.819.963 1.384 1.214.565.25 1.188.318 1.789.194a3.043 3.043 0 0 0 1.588-.892c.434-.457.729-1.04.849-1.675a3.433 3.433 0 0 0-.179-1.89 3.223 3.223 0 0 0-1.145-1.465 2.972 2.972 0 0 0-1.723-.542 3.018 3.018 0 0 0-2.168.97 3.37 3.37 0 0 0-.895 2.301l-.009-.037Z"
          ></path>
          <path
            fill="#010101"
            d="M205.922 26.588a7.903 7.903 0 0 1 1.274 1.843 1.48 1.48 0 0 1-.689.046c-.131 0-.157-.12-.209-.212-.201-.369-.393-.746-.629-1.106a.997.997 0 0 0-.396-.37.94.94 0 0 0-.52-.1c-.174 0-.253.046-.244.249v1.253c0 .415 0 .286-.271.295h-.192c-.157 0-.192-.073-.192-.22V24.56c0-.322 0-.331.323-.322a13.357 13.357 0 0 1 1.745.046c.247.002.485.096.673.264.188.169.314.401.357.657.035.277-.027.557-.173.789-.146.232-.366.4-.621.474l-.236.12Zm-1.387-.507c.408.023.817.005 1.222-.055a.534.534 0 0 0 .362-.21.597.597 0 0 0 .118-.417.597.597 0 0 0-.164-.378.535.535 0 0 0-.36-.166 6.37 6.37 0 0 0-1.03 0c-.13 0-.183.065-.174.194-.003.345.015.69.052 1.032h-.026Z"
          ></path>
          <path
            fill="#20A64B"
            d="M86.584 22.137v-.019H63.94v11.226h-.061v.008h-6.998v7.428h7.059v9.659h7.076V40.78h7.024v-7.428h-7.024v-3.741h15.567v-7.474Z"
          ></path>
          <path
            fill="#010101"
            d="M166.326 29.39v-6.903h-21.692v28.118h21.692v-6.912h-14.45v-4.046h11.666V33.13h-11.666V29.39h14.45ZM193.043 22.496l-9.092 11.105h-.069l-9.092-11.105h-6.291V50.604h7.547V35.049l7.286 9.16v.01h1.143v-.396l.017.396 7.304-9.17v15.557h7.547V22.496h-6.3ZM142.226 43.536c-.873 0-1.675 0-2.513-.046a3.923 3.923 0 0 1-2.077-.728 12.404 12.404 0 0 1-2.391-2.59 8.383 8.383 0 0 0 1.946-.663c3.15-1.54 4.895-4.083 4.93-7.816a9.055 9.055 0 0 0-1.454-5.17c-.991-1.517-2.413-2.663-4.06-3.271a11.932 11.932 0 0 0-4.607-.839h-13.403V50.54h7.583V40.458h.741l.236.34a57.4 57.4 0 0 0 4.057 5.53 13.339 13.339 0 0 0 2.618 2.415 9.478 9.478 0 0 0 4.293 1.705 29.08 29.08 0 0 0 3.691.12h.803v-7.032h-.393Zm-10.209-8.516h-5.837v-5.75H131.432c.408-.005.814.07 1.196.22a2.656 2.656 0 0 1 1.347 1.177c.308.544.43 1.183.346 1.81a2.845 2.845 0 0 1-.719 1.709c-.421.464-.981.76-1.585.834Z"
          ></path>
          <path fill="#007945" d="M71 33.362h-7.077v7.41H71v-7.41Z"></path>
          <path
            fill="#9A9B9C"
            d="m63.208 11.317.174.166c.175.175.34.35.489.489L46.306 30.505l-.645-.682 17.547-18.506ZM51.15 15.39a4.31 4.31 0 0 1-.79 2.748 3.91 3.91 0 0 1-2.291 1.547 3.757 3.757 0 0 1-1.569.094 3.827 3.827 0 0 1-1.48-.559 4.05 4.05 0 0 1-1.158-1.122 4.296 4.296 0 0 1-.653-1.51 4.56 4.56 0 0 1 .18-2.69 4.279 4.279 0 0 1 1.652-2.055 3.855 3.855 0 0 1 3.806-.243 4.09 4.09 0 0 1 1.532 1.3c.402.56.666 1.216.77 1.91.009.194.009.387 0 .58Zm-6.981.065c.052.341.07.645.13.922a3.07 3.07 0 0 0 .976 1.651 2.79 2.79 0 0 0 1.723.689c.63.024 1.25-.171 1.766-.556a3.038 3.038 0 0 0 1.085-1.572 3.885 3.885 0 0 0 .113-1.714 3.052 3.052 0 0 0-.828-1.771 2.766 2.766 0 0 0-1.693-.837 2.675 2.675 0 0 0-1.932.46c-.569.396-.98 1-1.157 1.696-.07.341-.122.685-.157 1.032h-.026ZM18.952 18.321v-2.239h-1.676v-.986c.903-.081 1.811-.081 2.714 0 .025.084.04.17.044.258v3.428a.415.415 0 0 1-.049.263.38.38 0 0 1-.196.17 5.48 5.48 0 0 1-4.1.387 3.687 3.687 0 0 1-1.835-1.253 4.025 4.025 0 0 1-.844-2.129 4.434 4.434 0 0 1 .331-2.562 3.914 3.914 0 0 1 1.324-1.692 3.61 3.61 0 0 1 1.974-.685 4.756 4.756 0 0 1 2.034.24c.452.157.86.433 1.186.8l-.724.84-.192-.157a2.909 2.909 0 0 0-1.359-.669 2.824 2.824 0 0 0-1.494.116c-.55.17-1.037.517-1.392.992a3.012 3.012 0 0 0-.589 1.662c-.09.577-.026 1.17.183 1.711.21.542.557 1.012 1.004 1.358a2.849 2.849 0 0 0 1.937.608 3.71 3.71 0 0 0 1.719-.46ZM22.154 11.446h2.696c.318.006.634.05.943.13.449.096.85.358 1.132.74.282.383.425.858.403 1.342.015.475-.12.942-.384 1.327a2.04 2.04 0 0 1-1.073.802c-.122.046-.244.074-.419.12l2.164 3.686h-1.308c-.062-.11-.14-.23-.21-.36-.523-.92-1.056-1.925-1.58-2.902a.464.464 0 0 0-.187-.233.426.426 0 0 0-.284-.062h-.872v3.548h-1.047l.026-8.138Zm1.056 3.54a.922.922 0 0 0 .2 0h1.527c.14-.011.277-.036.41-.075.258-.045.49-.19.651-.406.162-.217.241-.49.222-.764a1.143 1.143 0 0 0-.196-.806 1.03 1.03 0 0 0-.676-.429 7.716 7.716 0 0 0-2.164-.11l.026 2.59ZM33.811 11.446h.995v5.309c0 .426-.085.848-.25 1.237a3.04 3.04 0 0 1-.705 1.023c-.3.285-.654.5-1.038.632-.384.131-.79.176-1.192.13a2.776 2.776 0 0 1-1.987-.918 3.097 3.097 0 0 1-.796-2.132v-5.271h1.02v4.912c.022.396.117.784.28 1.142.13.371.37.688.685.904.314.216.686.32 1.06.294.369.029.737-.068 1.05-.275.314-.207.557-.514.695-.877a3.57 3.57 0 0 0 .236-1.419v-4.69h-.053ZM36.926 11.446h2.697c.266.005.531.033.794.083.278.049.544.158.781.32.237.163.44.376.595.625a2.275 2.275 0 0 1 .273 1.71c-.061.457-.267.88-.583 1.2-.317.32-.726.516-1.162.56-.29.041-.581.066-.873.073h-1.492v3.549h-1.03v-8.12Zm1.056.922v2.599a6.879 6.879 0 0 0 2.138 0c.121-.039.238-.091.349-.157a.884.884 0 0 0 .28-.24.941.941 0 0 0 .165-.34c.192-.812 0-1.586-.995-1.715-.654-.129-1.265-.12-1.937-.147Z"
          ></path>
        </svg>
        <h1 className="text-3xl font-medium text-neutral-500 mt-10 tracking-widest">
          MONITOR
        </h1>
      </div>

      <div className="rounded-lg bg-neutral-800 px-8 py-12">
        <SocialProviders />
      </div>
    </div>
  );
};

export default Login;
