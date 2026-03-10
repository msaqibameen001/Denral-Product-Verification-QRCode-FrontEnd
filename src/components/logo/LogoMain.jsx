// material-ui
import { useTheme } from '@mui/material/styles';

// ==============================|| QR PRODUCT VERIFICATION SYSTEM LOGO ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <svg width="200" height="36" viewBox="0 0 200 36" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* QR Icon */}
      <rect
        x="2"
        y="6"
        width="26"
        height="24"
        rx="4"
        fill={theme.vars.palette.primary.main}
      />

      {/* QR Pattern */}
      <rect x="6" y="10" width="6" height="6" fill="white" />
      <rect x="16" y="10" width="4" height="4" fill="white" />
      <rect x="10" y="18" width="5" height="5" fill="white" />

      {/* Scan Line */}
      <rect
        x="2"
        y="17"
        width="26"
        height="2"
        fill={theme.vars.palette.warning.main}
      />

      {/* Text: QR */}
      <text
        x="40"
        y="22"
        fontSize="18"
        fontWeight="700"
        fill={theme.vars.palette.text.primary}
        fontFamily='"Sofia Sans", sans-serif'
      >
        QR
      </text>

      {/* Text: Verify */}
      <text
        x="65"
        y="22"
        fontSize="14"
        fontWeight="600"
        fill={theme.vars.palette.primary.main}
        fontFamily='"Sofia Sans", sans-serif'
      >
        Verify
      </text>
    </svg>
  );
}