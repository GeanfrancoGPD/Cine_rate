import zod from "zod";

class Validator {
  constructor() {}

  async validateEmail(email) {
    const emailSchema = zod.string().email();
    return emailSchema.safeParse(email);
  }
  async validatePassword(password) {
    const passwordSchema = zod
      .string()
      .min(4, "La contraseña debe tener al menos 4 caracteres")
      .max(64, "La contraseña no puede exceder los 64 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");
    return passwordSchema.safeParse(password);
  }

  async validateUsername(username) {
    const usernameSchema = zod
      .string()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(30, "El nombre de usuario no puede exceder los 30 caracteres")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "El nombre de usuario solo puede contener letras, números y guiones bajos",
      );
    return usernameSchema.safeParse(username);
  }

  async validateToken(token) {
    const tokenSchema = zod
      .string()
      .length(6, "El token debe tener exactamente 6 caracteres")
      .regex(
        /^[A-Z0-9]+$/,
        "El token solo puede contener letras mayúsculas y números",
      );
    return tokenSchema.safeParse(token);
  }

  async validateRecipeTitle(title) {
    const titleSchema = zod
      .string()
      .min(3, "El título de la receta debe tener al menos 3 caracteres")
      .max(120, "El título de la receta no puede exceder los 120 caracteres");
    return titleSchema.safeParse(title);
  }

  async validateRecipeDescription(description) {
    const descriptionSchema = zod
      .string()
      .max(
        1000,
        "La descripción de la receta no puede exceder los 1000 caracteres",
      );
    return descriptionSchema.safeParse(description ?? "");
  }

  async validateRecipeImageKey(imageKey) {
    const imageKeySchema = zod
      .string()
      .min(1, "La clave de la imagen es obligatoria")
      .max(255, "La clave de la imagen no puede exceder los 255 caracteres");
    return imageKeySchema.safeParse(imageKey);
  }

  async validateRecipeDifficulty(difficulty) {
    const difficultySchema = zod.enum([
      "Easy",
      "Medium",
      "Hard",
      "Beginner",
      "Intermediate",
    ]);
    return difficultySchema.safeParse(difficulty);
  }

  async validateRecipeTime(time) {
    const timeSchema = zod.coerce
      .number()
      .int("El tiempo de cocción debe ser un número entero")
      .min(1, "El tiempo de cocción debe ser mayor a 0")
      .max(1440, "El tiempo de cocción no puede exceder los 1440 minutos");
    return timeSchema.safeParse(time);
  }

  async validateRecipeCalories(calories) {
    const caloriesSchema = zod.coerce
      .number()
      .int("Las calorías deben ser un número entero")
      .min(0, "Las calorías no pueden ser negativas")
      .max(100000, "Las calorías no pueden exceder los 100000");
    return caloriesSchema.safeParse(calories);
  }

  async validateRecipeServings(servings) {
    const servingsSchema = zod.coerce
      .number()
      .int("Las porciones deben ser un número entero")
      .min(1, "Las porciones deben ser al menos 1")
      .max(100, "Las porciones no pueden exceder las 100");
    return servingsSchema.safeParse(servings);
  }

  async validateRecipeVisibility(isPublic) {
    const visibilitySchema = zod.boolean();
    return visibilitySchema.safeParse(isPublic);
  }

  async validateRecipeIngredientName(name) {
    const ingredientSchema = zod
      .string()
      .min(1, "El nombre del ingrediente es obligatorio")
      .max(
        120,
        "El nombre del ingrediente no puede exceder los 120 caracteres",
      );
    return ingredientSchema.safeParse(name);
  }

  async validateRecipeIngredientQuantity(quantity) {
    const quantitySchema = zod
      .string()
      .min(1, "La cantidad del ingrediente es obligatoria")
      .max(
        120,
        "La cantidad del ingrediente no puede exceder los 120 caracteres",
      );
    return quantitySchema.safeParse(quantity);
  }

  async validateRecipeStepDescription(description) {
    const stepSchema = zod
      .string()
      .min(1, "La descripción del paso es obligatoria")
      .max(500, "La descripción del paso no puede exceder los 500 caracteres");
    return stepSchema.safeParse(description);
  }
}

export default new Validator();
