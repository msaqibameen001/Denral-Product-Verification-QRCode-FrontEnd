import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

// icons
import { ChevronDown, ChevronRight } from 'lucide-react';

// project import
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

export default function NavGroup({ item }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [openCollapse, setOpenCollapse] = useState({});

  const handleToggle = (id) => {
    setOpenCollapse((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navCollapse = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case 'collapse': {
        const Icon = menuItem.icon;
        const itemIcon = menuItem.icon ? (
          <Icon
            size={20}
            strokeWidth={1.5}
            style={{
              minWidth: '20px',
              minHeight: '20px'
            }}
          />
        ) : (
          false
        );
        const isOpen = openCollapse[menuItem.id];

        return (
          <Box key={menuItem.id}>
            {/* COLLAPSE PARENT (NavItem styled) */}
            <ListItemButton
              onClick={() => handleToggle(menuItem.id)}
              sx={(theme) => ({
                pl: drawerOpen ? `${1 * 28}px` : 1.5,
                py: !drawerOpen ? 1.25 : 1,
                '&:hover': {
                  bgcolor: drawerOpen ? 'primary.lighter' : 'transparent'
                }
              })}
            >
              {/* ICON */}
              {itemIcon && (
                <ListItemIcon
                  sx={{
                    minWidth: 28,
                    color: '#A0A5AE',
                    ...(!drawerOpen && {
                      borderRadius: 1.5,
                      width: 36,
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': { bgcolor: 'secondary.lighter' }
                    })
                  }}
                >
                  {itemIcon}
                </ListItemIcon>
              )}

              {/* TEXT (ONLY WHEN DRAWER OPEN) */}
              {drawerOpen && (
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontFamily: '"Sofia Sans", sans-serif', color: '#A0A5AE' }}>
                      {menuItem.title}
                    </Typography>
                  }
                />
              )}

              {/* ARROW ICON */}
              {drawerOpen && (isOpen ? <ChevronDown size={16} color="#A4A4A4" /> : <ChevronRight size={16} color="#A4A4A4" />)}
            </ListItemButton>

            {/* COLLAPSE CHILDREN */}
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {menuItem.children?.map((child) => (
                  <NavItem key={child.id} item={child} level={2} isParents />
                ))}
              </List>
            </Collapse>
          </Box>
        );
      }

      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;

      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        drawerOpen && (
          <Box sx={{ pl: 3, mb: 1.5 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ fontFamily: '"Sofia Sans", sans-serif' }}>
              {item.title}
            </Typography>
          </Box>
        )
      }
      sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}
    >
      {navCollapse}
    </List>
  );
}

NavGroup.propTypes = {
  item: PropTypes.object
};
