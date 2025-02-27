import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    target_audience: z.string().min(2, "Target audience is required."),
    cadence: z.string(),
    platforms: z.string()
});

const CampaignFormV2 = ({ onSubmit, isLoading }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            target_audience: "",
            cadence: "",
            platforms: ""
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[47.5%]">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Campaign Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter campaign name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your campaign goals"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="target_audience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Target Audience</FormLabel>
                            <FormControl>
                                <Input placeholder="Who is this campaign for?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cadence"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Posting Cadence</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select posting frequency" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <div className="flex flex-wrap gap-y-4 gap-x-10">
                                {[
                                    { name: "Instagram", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="h-8 w-fit" /> },
                                    { name: "Facebook", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="h-8 w-fit" /> },
                                    { name: "LinkedIn", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" className="h-8 w-fit" /> },
                                    { name: "X", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="X" className="h-8 w-fit" /> },
                                    { name: "TikTok", icon: <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1024px-TikTok_logo.svg.png" alt="TikTok" className="h-8 w-fit" /> },
                                    { name: "Gmail", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="h-8 w-fit" /> },
                                    { name: "SMS", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IMessage_logo.svg" alt="SMS" className="h-8 w-fit" /> },
                                ].map((platform) => (
                                    <label key={platform.name} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="platform"
                                            value={platform.name}
                                            onChange={() => field.onChange(platform.name)}
                                            checked={field.value === platform.name}
                                            className="form-radio custom-radio"
                                            style={{
                                                appearance: 'none',
                                                width: '1.25rem',
                                                height: '1.25rem',
                                                backgroundColor: field.value === platform.name ? '#CFB232' : '#fff',
                                                border: '2px solid #d1d5db',
                                                borderRadius: '50%',
                                                display: 'grid',
                                                placeContent: 'center',
                                                cursor: 'pointer',
                                            }}
                                        />
                                        <span className="flex items-center space-x-2">
                                            {platform.icon}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="h-10 flex items-center justify-center">
                    {isLoading && <Loader2 className="mr-2  h-4 w-4 animate-spin" />}
                    Generate Campaign
                </Button>
            </form>
        </Form>
    );
};

export default CampaignFormV2;