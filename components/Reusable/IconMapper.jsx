import * as CgIcons from "react-icons/cg";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as BsIcons from "react-icons/bs";
import * as SlIcons from "react-icons/sl";
import * as PiIcons from "react-icons/pi";
import * as IoIcons from "react-icons/io";
import * as BiIcons from "react-icons/bi";
import * as TiIcons from "react-icons/ti";
import * as MdIcons from "react-icons/md";
import * as LuIcons from "react-icons/lu";
import * as FiIcons from "react-icons/fi";
import * as Hi2Icons from "react-icons/hi2"
// Add more packs as needed

const iconPacks = {
    cg: CgIcons,
    fa: FaIcons,
    fa6: Fa6Icons,
    bs: BsIcons,
    sl: SlIcons,
    pi: PiIcons,
    io: IoIcons,
    bi: BiIcons,
    ti: TiIcons,
    md: MdIcons,
    lu: LuIcons,
    fi: FiIcons,
    hi2: Hi2Icons
};

/**
 * Get icon component from string like "CgMediaLive"
 */
export function getIconComponent(iconName) {
  if (!iconName) return null;

  for (const [packKey, iconPack] of Object.entries(iconPacks)) {
    if (iconPack[iconName]) {
      return iconPack[iconName];
    }
  }
  return null;
}





