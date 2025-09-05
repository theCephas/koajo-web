function ExagonIcon({
  className,
  gradientColors = { start: "#fff", stop: "#fff" },
}: {
  className?: string;
  gradientColors?: { start: string; stop: string };
}) {
  const { start, stop } = gradientColors;

  return (
    <svg
      width="51"
      height="55"
      viewBox="0 0 51 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_di_1815_7724)">
        <path
          d="M22.9927 4.44763C24.5443 3.55183 26.4559 3.55183 28.0074 4.44763L41.9928 12.5221C43.5443 13.4179 44.5002 15.0734 44.5002 16.8649V33.0138C44.5002 34.8054 43.5443 36.4609 41.9928 37.3567L28.0074 45.4312C26.4559 46.327 24.5443 46.327 22.9927 45.4312L9.00736 37.3567C7.4558 36.4609 6.5 34.8054 6.5 33.0138V16.865C6.5 15.0734 7.4558 13.4179 9.00736 12.5221L22.9927 4.44763Z"
          fill="url(#paint0_linear_1815_7724)"
        />
        <path
          d="M22.3662 3.3623C24.3056 2.24265 26.6944 2.24269 28.6338 3.3623L42.6201 11.4365C44.5593 12.5563 45.7539 14.6259 45.7539 16.8652V33.0137C45.7539 35.253 44.5593 37.3226 42.6201 38.4424L28.6338 46.5166C26.6944 47.6362 24.3056 47.6362 22.3662 46.5166L8.38086 38.4424C6.44141 37.3226 5.24609 35.2532 5.24609 33.0137V16.8652C5.24609 14.6258 6.44141 12.5563 8.38086 11.4365L22.3662 3.3623Z"
          stroke="white"
          stroke-width="2.50736"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_1815_7724"
          x="0.231636"
          y="0.0146306"
          width="50.5367"
          height="54.8641"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.50736" />
          <feGaussianBlur stdDeviation="1.88052" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1815_7724"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1815_7724"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3.76104" />
          <feGaussianBlur stdDeviation="0.62684" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_1815_7724"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1815_7724"
          x1="25.5001"
          y1="3"
          x2="25.5001"
          y2="46.8788"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.223549" stop-color={start} />
          <stop offset="1" stop-color={stop} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default ExagonIcon;
