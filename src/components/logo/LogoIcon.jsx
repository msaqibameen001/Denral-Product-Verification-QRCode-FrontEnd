// material-ui
import { useTheme } from '@mui/material/styles';

// ==============================|| QR PRODUCT VERIFICATION LOGO ICON ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <svg
      width="129"
      height="129"
      viewBox="0 0 129 129"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* QR Box */}
      <rect
        x="24"
        y="24"
        width="81"
        height="81"
        rx="12"
        fill={theme.vars.palette.primary.main}
      />

      {/* QR Pattern */}
      <rect x="36" y="36" width="12" height="12" fill="white" />
      <rect x="54" y="36" width="8" height="8" fill="white" />
      <rect x="72" y="36" width="12" height="12" fill="white" />

      <rect x="36" y="60" width="8" height="8" fill="white" />
      <rect x="60" y="60" width="10" height="10" fill="white" />
      <rect x="78" y="60" width="8" height="8" fill="white" />

      <rect x="36" y="80" width="12" height="12" fill="white" />
      <rect x="60" y="86" width="8" height="8" fill="white" />

      {/* Scan Line */}
      <rect
        x="24"
        y="62"
        width="81"
        height="3"
        fill={theme.vars.palette.warning.main}
      />
    </svg>
  );
}