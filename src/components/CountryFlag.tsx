import React from "react";
import { Text, TextStyle } from "react-native";

const countryToFlag: Record<string, string> = {
  USA: "🇺🇸",
  US: "🇺🇸",
  "United States": "🇺🇸",
  England: "🇬🇧",
  "United Kingdom": "🇬🇧",
  UK: "🇬🇧",
  Australia: "🇦🇺",
  Argentina: "🇦🇷",
  Spain: "🇪🇸",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
  China: "🇨🇳",
  Switzerland: "🇨🇭",
  Portugal: "🇵🇹",
  Norway: "🇳🇴",
  Chile: "🇨🇱",
  Romania: "🇷🇴",
  Cyprus: "🇨🇾",
  Denmark: "🇩🇰",
  Monaco: "🇲🇨",
  Sweden: "🇸🇪",
  Serbia: "🇷🇸",
  India: "🇮🇳",
  Austria: "🇦🇹",
  Poland: "🇵🇱",
  Netherlands: "🇳🇱",
  Thailand: "🇹🇭",
  Morocco: "🇲🇦",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  UAE: "🇦🇪",
  "Hong Kong": "🇭🇰",
  "Czech Republic": "🇨🇿",
  Croatia: "🇭🇷",
  Slovakia: "🇸🇰",
  Finland: "🇫🇮",
  Kazakhstan: "🇰🇿",
  Taiwan: "🇹🇼",
  Japan: "🇯🇵",
  Belgium: "🇧🇪",
  Luxembourg: "🇱🇺",
  "Costa Rica": "🇨🇷",
  Colombia: "🇨🇴",
  "South Korea": "🇰🇷",
};

interface Props {
  countryName: string;
  showName?: boolean;
  style?: TextStyle;
}

export function CountryFlag({ countryName, showName = true, style }: Props) {
  const flag = countryToFlag[countryName] ?? "🏳️";
  return <Text style={style}>{showName ? `${countryName} ${flag}` : flag}</Text>;
}
