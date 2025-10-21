// Simplified Icon Mappings for Available Libraries Only

// Lucide Icons (available)
import { 
  Wallet as LucideWallet, 
  Mail as LucideMail, 
  Music as LucideMusic, 
  FileText as LucideFileText, 
  HardDrive as LucideHardDrive, 
  Globe as LucideGlobe, 
  Terminal as LucideTerminal, 
  Settings as LucideSettings, 
  Calendar as LucideCalendar, 
  Search as LucideSearch, 
  TrendingUp as LucideTrendingUp, 
  Briefcase as LucideBriefcase, 
  Table as LucideTable, 
  Share2 as LucideShare2,
  DollarSign as LucideDollarSign,
  Store as LucideStore,
  Code2 as LucideCode2,
  Video as LucideVideo,
  Camera as LucideCamera,
  MapPin as LucideMapPin,
  MessageCircle as LucideMessageCircle,
  Users as LucideUsers,
  Gamepad2 as LucideGamepad2,
  BookOpen as LucideBookOpen,
  Box as LucideBox,
  Palette as LucidePalette,
  GraduationCap as LucideGraduationCap,
  UserCheck as LucideUserCheck,
  Circle as LucideCircle,
  Monitor as LucideMonitor
} from 'lucide-react'

// React Icons (Material Design) - available
import { 
  MdAccountBalanceWallet,
  MdEmail,
  MdLibraryMusic,
  MdDescription,
  MdStorage,
  MdLanguage,
  MdTerminal,
  MdSettings,
  MdCalendarToday,
  MdSearch,
  MdTrendingUp,
  MdWork,
  MdTableChart,
  MdShare,
  MdAttachMoney,
  MdStore,
  MdCode,
  MdShowChart,
  MdVideoLibrary,
  MdPhotoCamera,
  MdLocationOn,
  MdChat,
  MdGroup,
  MdSportsEsports,
  MdMenuBook,
  MdViewInAr,
  MdPalette,
  MdSchool,
  MdVerifiedUser,
  MdCircle,
  MdMonitor
} from 'react-icons/md'

export interface CompleteIconMapping {
  lucide: any
  'react-icons': any
}

export const completeIconMappings: { [key: string]: CompleteIconMapping } = {
  // Bitcoin Apps
  'bitcoin-wallet': { lucide: LucideWallet, 'react-icons': MdAccountBalanceWallet },
  'bitcoin-email': { lucide: LucideMail, 'react-icons': MdEmail },
  'bitcoin-music': { lucide: LucideMusic, 'react-icons': MdLibraryMusic },
  'bitcoin-writer': { lucide: LucideFileText, 'react-icons': MdDescription },
  'bitcoin-code': { lucide: LucideCode2, 'react-icons': MdCode },
  'bitcoin-drive': { lucide: LucideHardDrive, 'react-icons': MdStorage },
  'bitcoin-calendar': { lucide: LucideCalendar, 'react-icons': MdCalendarToday },
  'bitcoin-exchange': { lucide: LucideTrendingUp, 'react-icons': MdShowChart },
  'bitcoin-search': { lucide: LucideSearch, 'react-icons': MdSearch },
  'bitcoin-spreadsheet': { lucide: LucideTable, 'react-icons': MdTableChart },
  'bitcoin-video': { lucide: LucideVideo, 'react-icons': MdVideoLibrary },
  'bitcoin-photos': { lucide: LucideCamera, 'react-icons': MdPhotoCamera },
  'bitcoin-maps': { lucide: LucideMapPin, 'react-icons': MdLocationOn },
  'bitcoin-chat': { lucide: LucideMessageCircle, 'react-icons': MdChat },
  'bitcoin-social': { lucide: LucideUsers, 'react-icons': MdGroup },
  'bitcoin-games': { lucide: LucideGamepad2, 'react-icons': MdSportsEsports },
  'bitcoin-books': { lucide: LucideBookOpen, 'react-icons': MdMenuBook },
  'bitcoin-domains': { lucide: LucideGlobe, 'react-icons': MdLanguage },
  'bitcoin-3d': { lucide: LucideBox, 'react-icons': MdViewInAr },
  'bitcoin-jobs': { lucide: LucideBriefcase, 'react-icons': MdWork },
  'bitcoin-paint': { lucide: LucidePalette, 'react-icons': MdPalette },
  'bapps-store': { lucide: LucideStore, 'react-icons': MdStore },
  'bitcoin-education': { lucide: LucideGraduationCap, 'react-icons': MdSchool },
  'bitcoin-identity': { lucide: LucideUserCheck, 'react-icons': MdVerifiedUser },
  'bitcoin-os': { lucide: LucideMonitor, 'react-icons': MdMonitor },
  
  // Desktop icons (shorter names)
  'wallet': { lucide: LucideWallet, 'react-icons': MdAccountBalanceWallet },
  'email': { lucide: LucideMail, 'react-icons': MdEmail },
  'music': { lucide: LucideMusic, 'react-icons': MdLibraryMusic },
  'writer': { lucide: LucideFileText, 'react-icons': MdDescription },
  'drive': { lucide: LucideHardDrive, 'react-icons': MdStorage },
  'calendar': { lucide: LucideCalendar, 'react-icons': MdCalendarToday },
  'exchange': { lucide: LucideTrendingUp, 'react-icons': MdShowChart },
  'spreadsheet': { lucide: LucideTable, 'react-icons': MdTableChart },
  'search': { lucide: LucideSearch, 'react-icons': MdSearch },
  'identity': { lucide: LucideUserCheck, 'react-icons': MdVerifiedUser },
  'jobs': { lucide: LucideBriefcase, 'react-icons': MdWork },
  'video': { lucide: LucideVideo, 'react-icons': MdVideoLibrary },
  'education': { lucide: LucideGraduationCap, 'react-icons': MdSchool },
  'code': { lucide: LucideCode2, 'react-icons': MdCode },
  'paint': { lucide: LucidePalette, 'react-icons': MdPalette },
  'domains': { lucide: LucideGlobe, 'react-icons': MdLanguage },
  '3d': { lucide: LucideBox, 'react-icons': MdViewInAr },
  'photos': { lucide: LucideCamera, 'react-icons': MdPhotoCamera },
  'maps': { lucide: LucideMapPin, 'react-icons': MdLocationOn },
  'chat': { lucide: LucideMessageCircle, 'react-icons': MdChat },
  'social': { lucide: LucideUsers, 'react-icons': MdGroup },
  'games': { lucide: LucideGamepad2, 'react-icons': MdSportsEsports },
  'books': { lucide: LucideBookOpen, 'react-icons': MdMenuBook },
  'home': { lucide: LucideCircle, 'react-icons': MdCircle },
  'os': { lucide: LucideMonitor, 'react-icons': MdMonitor },
}

export const getCompleteThemedIcon = (iconId: string, theme: string = 'lucide') => {
  const mapping = completeIconMappings[iconId.toLowerCase()]
  
  if (!mapping) {
    // Fallback to lucide circle for unknown icons
    return LucideCircle
  }
  
  // Only support lucide and react-icons for now
  if (theme === 'react-icons' && mapping['react-icons']) {
    return mapping['react-icons']
  }
  
  // Default to lucide
  return mapping.lucide || LucideCircle
}