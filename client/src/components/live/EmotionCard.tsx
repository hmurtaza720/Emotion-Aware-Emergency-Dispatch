import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmotionCard = ({
    emotion,
    percentage,
    color,
}: {
    emotion: string;
    percentage: number;
    color: string;
}) => {
    return (
        <Card className="h-full w-[50%] border-slate-700 bg-slate-800/50 shadow-sm">
            <CardHeader className="p-2 pb-0 pt-3">
                <CardTitle className="text-slate-500">
                    <p className="text-[10px] uppercase tracking-widest leading-3">CALLER EMOTION</p>
                    <div className="line-clamp-1 text-xl font-bold text-slate-200">
                        {emotion}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-full rounded-full bg-slate-700">
                        <div
                            className={`h-2 rounded-full ${color} shadow-[0_0_10px_rgba(168,85,247,0.5)]`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="pr-2 text-xs font-mono font-bold text-slate-400">
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
export default EmotionCard;
