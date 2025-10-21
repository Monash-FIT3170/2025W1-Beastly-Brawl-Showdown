import React from "react";

import StunAnimation from "./StunAnimation";
import DodgeAnimation from "./DodgeAnimation";
import DoubleAttackAnimation from "./DoubleAttackAnimation";
import AttackBonusAnimation from "./AttackBonusAnimation";

export type AbilityKind =
  | "stun"
  | "dodge"
  | "double-attack"
  | "attack-bonus-next3";

type AnimProps = { isVisible: boolean; onComplete: () => void };

const registry: Partial<Record<AbilityKind, React.FC<AnimProps>>> = {
  stun: StunAnimation,
  dodge: DodgeAnimation,
  "double-attack": DoubleAttackAnimation,
  "attack-bonus-next3": AttackBonusAnimation,
};

type Props = {
  kind: AbilityKind | null;
  visible: boolean;
  onComplete: () => void;
};

export default function AbilityOverlay({ kind, visible, onComplete }: Props) {
  if (!visible || !kind) return null;

  const Comp = registry[kind];
  if (!Comp) return null;

  return <Comp isVisible onComplete={onComplete} />;
}
