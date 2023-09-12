import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const VisibilityToggleMuiIcon = ({ 
  reveal, 
}: { reveal: boolean }) => {
  return reveal ? (
    <VisibilityOffIcon fontSize="small" />
  ) : (
    <VisibilityIcon fontSize="small" />
  );
};