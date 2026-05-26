export interface Crew {
  driver: string;
  passengers: string[];
  dog: string;
}

export const DEFAULT_CREW: Crew = {
  driver: "Andrew",
  passengers: ["Sarah", "Ethan", "Alex"],
  dog: "Rosie",
};
