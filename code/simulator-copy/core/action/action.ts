export type Action<AT extends string> = Readonly<{
  /**
   * The type of action - used to discriminate type
   */
  type: AT;
}>;