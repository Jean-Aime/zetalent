import {
  Circle, Dribbble, Hand, Activity, Trophy,
  Twitter, Instagram, Youtube, Facebook,
  ArrowRight, ArrowLeft, ChevronRight, ChevronDown, ChevronLeft,
  Search, Menu, X, Sun, Moon, Globe, LogIn, TrendingUp,
  Calendar, Clock, MapPin, Mail, Phone, Send, Heart,
  Star, Eye, Check, Lock, User, EyeOff, Loader2,
  Shield, Award, Users, Lightbulb, Target,
  Tag, Share2, Bookmark, Printer, Linkedin,
  SlidersHorizontal, MessageCircle,
  type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Circle, Dribbble, Hand, Activity, Trophy,
  Twitter, Instagram, Youtube, Facebook,
  ArrowRight, ArrowLeft, ChevronRight, ChevronDown, ChevronLeft,
  Search, Menu, X, Sun, Moon, Globe, LogIn, TrendingUp,
  Calendar, Clock, MapPin, Mail, Phone, Send, Heart,
  Star, Eye, Check, Lock, User, EyeOff, Loader2,
  Shield, Award, Users, Lightbulb, Target,
  Tag, Share2, Bookmark, Printer, Linkedin,
  SlidersHorizontal, MessageCircle,
  Volleyball: Circle,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Trophy;
}
