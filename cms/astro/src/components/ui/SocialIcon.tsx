import reddit from '@/assets/icons/social/reddit.svg?url';
import linkedin from '@/assets/icons/social/linkedin.svg?url';
import twitter from '@/assets/icons/social/twitter.svg?url';
import x from '@/assets/icons/social/x.svg?url';
import github from '@/assets/icons/social/github.svg?url';
import instagram from '@/assets/icons/social/instagram.svg?url';
import facebook from '@/assets/icons/social/facebook.svg?url';
import discord from '@/assets/icons/social/discord.svg?url';
import youtube from '@/assets/icons/social/youtube.svg?url';
import bluesky from '@/assets/icons/social/bluesky.svg?url';

const socialIcons: Record<string, string> = {
  reddit,
  linkedin,
  twitter,
  x,
  github,
  instagram,
  facebook,
  discord,
  youtube,
  bluesky,
};

interface SocialIconProps extends React.HTMLAttributes<HTMLImageElement> {
  service: string;
  alt?: string;
  className?: string;
  size?: number;
}

const SocialIcon = ({ service, alt, className, size = 24, ...props }: SocialIconProps) => {
  const key = service.toLowerCase();
  const icon = socialIcons[key];

  if (!icon) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-muted text-xs text-foreground dark:text-white flex items-center justify-center rounded-full ${className || ''}`}
        title={service}
        {...props}
      >
        {service[0]?.toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={icon}
      alt={alt || `${service} icon`}
      width={size}
      height={size}
      className={`dark:invert ${className || ''}`}
      {...props}
    />
  );
};

export default SocialIcon;
