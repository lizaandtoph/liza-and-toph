import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import QuestionnaireStep from "@/components/questionnaire-step";
import { insertChildProfileSchema } from "@shared/schema";
import { ArrowLeft, ArrowRight } from "lucide-react";

const formSchema = insertChildProfileSchema.extend({
  name: z.string().optional(),
  ageRange: z.string().min(1, "Please select an age range"),
  gender: z.string().optional(),
  interests: z.array(z.string()).default([]),
  parentPreferences: z.object({
    budget: z.string().optional(),
    categories: z.array(z.string()).default([])
  }).default({})
});

type FormData = z.infer<typeof formSchema>;

const AGE_RANGES = [
  "0-6 months",
  "6-12 months", 
  "1-2 years",
  "2-3 years",
  "3-4 years",
  "4-5 years"
];

const INTERESTS = [
  "Music & Sounds",
  "Colors & Patterns",
  "Textures & Touch",
  "Movement & Motion",
  "Books & Stories",
  "Building & Stacking",
  "Animals & Nature",
  "Cause & Effect"
];

const CATEGORIES = [
  "Cognitive Development",
  "Motor Skills",
  "Social-Emotional",
  "Language Development"
];

export default function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ageRange: "",
      gender: "",
      interests: [],
      parentPreferences: {
        budget: "",
        categories: []
      }
    }
  });

  const createChildProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/child-profiles", data);
      return response.json();
    },
    onSuccess: async (childProfile) => {
      // Create play board
      const playBoardResponse = await apiRequest("POST", "/api/play-boards", {
        childProfileId: childProfile.id
      });
      const playBoard = await playBoardResponse.json();
      
      toast({
        title: "Success!",
        description: "Your Play Board has been created successfully.",
      });
      
      setLocation(`/play-board/${playBoard.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create your Play Board. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating child profile:", error);
    }
  });

  const onSubmit = (data: FormData) => {
    createChildProfileMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 1:
        return values.ageRange !== "";
      case 2:
        return true; // Development stage is optional
      case 3:
        return true; // Interests are optional
      case 4:
        return true; // Preferences are optional
      default:
        return true;
    }
  };

  const steps = [
    { number: 1, title: "Child Info", active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: "Development", active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: "Interests", active: currentStep === 3, completed: currentStep > 3 },
    { number: 4, title: "Preferences", active: currentStep === 4, completed: currentStep > 4 }
  ];

  return (
    <main className="pt-16 bg-background">
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className={`progress-step w-10 h-10 rounded-full flex items-center justify-center font-heading font-semibold text-sm ${
                    step.active ? 'active' : step.completed ? 'completed' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.number}
                  </div>
                  {index < steps.length - 1 && <div className="flex-1 h-1 bg-muted mx-2" />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground px-2">
              {steps.map(step => (
                <span key={step.number} className={step.active ? "font-medium text-primary" : ""}>
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="bg-card shadow-lg border border-border">
                <CardContent className="p-8 sm:p-12">
                  <div className="mb-8">
                    <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
                      Step {currentStep} of 4
                    </span>
                    
                    <QuestionnaireStep currentStep={currentStep}>
                      {/* Step 1: Child Info */}
                      {currentStep === 1 && (
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                            Tell us about your child
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            This helps us personalize the Play Board to your child's unique needs
                          </p>

                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Child's Name <span className="text-muted-foreground">(Optional)</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your child's name" 
                                      {...field}
                                      data-testid="input-child-name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="ageRange"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    How old is your child? <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      {AGE_RANGES.map(range => (
                                        <button
                                          key={range}
                                          type="button"
                                          onClick={() => field.onChange(range)}
                                          className={`px-4 py-3 border-2 rounded-lg transition text-center font-medium ${
                                            field.value === range
                                              ? 'border-primary bg-primary/5 text-foreground'
                                              : 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground'
                                          }`}
                                          data-testid={`button-age-${range}`}
                                        >
                                          {range}
                                        </button>
                                      ))}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Gender <span className="text-muted-foreground">(Optional)</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className="grid grid-cols-3 gap-3">
                                      {["Boy", "Girl", "Other"].map(gender => (
                                        <button
                                          key={gender}
                                          type="button"
                                          onClick={() => field.onChange(gender)}
                                          className={`px-4 py-3 border-2 rounded-lg transition text-center font-medium ${
                                            field.value === gender
                                              ? 'border-primary bg-primary/5 text-foreground'
                                              : 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground'
                                          }`}
                                          data-testid={`button-gender-${gender.toLowerCase()}`}
                                        >
                                          {gender}
                                        </button>
                                      ))}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 2: Development Stage */}
                      {currentStep === 2 && (
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                            Development Focus Areas
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            Which areas would you like to focus on most?
                          </p>

                          <FormField
                            control={form.control}
                            name="parentPreferences.categories"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select focus areas (Optional)</FormLabel>
                                <FormControl>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {CATEGORIES.map(category => (
                                      <button
                                        key={category}
                                        type="button"
                                        onClick={() => {
                                          const currentCategories = field.value || [];
                                          if (currentCategories.includes(category)) {
                                            field.onChange(currentCategories.filter(c => c !== category));
                                          } else {
                                            field.onChange([...currentCategories, category]);
                                          }
                                        }}
                                        className={`px-4 py-3 border-2 rounded-lg transition text-left font-medium ${
                                          field.value?.includes(category)
                                            ? 'border-primary bg-primary/5 text-foreground'
                                            : 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground'
                                        }`}
                                        data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                                      >
                                        {category}
                                      </button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Step 3: Interests */}
                      {currentStep === 3 && (
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                            What does your child enjoy?
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            Select activities and items that capture your child's attention
                          </p>

                          <FormField
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select interests (Optional)</FormLabel>
                                <FormControl>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {INTERESTS.map(interest => (
                                      <button
                                        key={interest}
                                        type="button"
                                        onClick={() => {
                                          const currentInterests = field.value || [];
                                          if (currentInterests.includes(interest)) {
                                            field.onChange(currentInterests.filter(i => i !== interest));
                                          } else {
                                            field.onChange([...currentInterests, interest]);
                                          }
                                        }}
                                        className={`px-4 py-3 border-2 rounded-lg transition text-center font-medium ${
                                          field.value?.includes(interest)
                                            ? 'border-primary bg-primary/5 text-foreground'
                                            : 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground'
                                        }`}
                                        data-testid={`button-interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                                      >
                                        {interest}
                                      </button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Step 4: Parent Preferences */}
                      {currentStep === 4 && (
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                            Final preferences
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            Help us tailor our product recommendations
                          </p>

                          <FormField
                            control={form.control}
                            name="parentPreferences.budget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Budget range for toy recommendations <span className="text-muted-foreground">(Optional)</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {["Under $25", "$25-50", "$50-100", "$100+"].map(budget => (
                                      <button
                                        key={budget}
                                        type="button"
                                        onClick={() => field.onChange(budget)}
                                        className={`px-4 py-3 border-2 rounded-lg transition text-center font-medium ${
                                          field.value === budget
                                            ? 'border-primary bg-primary/5 text-foreground'
                                            : 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground'
                                        }`}
                                        data-testid={`button-budget-${budget.toLowerCase().replace(/\s+/g, '-').replace(/\$|\+/g, '')}`}
                                      >
                                        {budget}
                                      </button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </QuestionnaireStep>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-10 pt-8 border-t border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="px-6 py-3"
                      data-testid="button-previous"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className="px-8 py-3 font-heading font-semibold"
                        data-testid="button-next"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createChildProfileMutation.isPending}
                        className="px-8 py-3 font-heading font-semibold"
                        data-testid="button-create-play-board"
                      >
                        {createChildProfileMutation.isPending ? "Creating..." : "Create Play Board"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </section>
    </main>
  );
}
