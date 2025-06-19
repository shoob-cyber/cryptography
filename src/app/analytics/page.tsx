
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import type { Message } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Wallet, BookCheck, AlertTriangle, CheckCircle2, Clock, ListChecks, ArrowRightLeft, FileText, Bot, Network, Landmark } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const CHAT_STORAGE_KEY_PREFIX = "blocktalk_chat_";

interface AnalyticsData {
  totalMessagesSent: number;
  totalMessagesHashed: number;
  totalHashesLoggedOnChain: number;
  confirmedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  averageConfirmationTimeMs: number; // Mocked
  totalGasFeesEth: number; // Mocked
  averageGasFeeEth: number; // Mocked
  tamperedMessagesDetected: number; // Mocked
  aiAdvisorInteractions: number; // Mocked
}

const initialAnalyticsData: AnalyticsData = {
  totalMessagesSent: 0,
  totalMessagesHashed: 0,
  totalHashesLoggedOnChain: 0,
  confirmedTransactions: 0,
  pendingTransactions: 0,
  failedTransactions: 0,
  averageConfirmationTimeMs: 2500, // Mock value
  totalGasFeesEth: 0,
  averageGasFeeEth: 0,
  tamperedMessagesDetected: 0, // Mock value
  aiAdvisorInteractions: 3, // Mock value, e.g. from previous sessions
};

const AnimatedCounter = ({ value, duration = 1000 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration;
    const incrementTime = (totalMiliseconds / end) || 0;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className="text-3xl font-bold">{count.toLocaleString()}</span>;
};


export default function AnalyticsDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialAnalyticsData);
  const [isLoading, setIsLoading] = useState(true);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "N/A (Not Set)";


  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchAnalyticsData = async () => {
        setIsLoading(true);
        let allMessages: Message[] = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${CHAT_STORAGE_KEY_PREFIX}${user.id}_`)) {
              const storedMessagesRaw = localStorage.getItem(key);
              if (storedMessagesRaw) {
                const parsedMessages: Message[] = JSON.parse(storedMessagesRaw).map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp),
                }));
                allMessages.push(...parsedMessages);
              }
            }
          }

          const totalMessagesSent = allMessages.length;
          const totalMessagesHashed = allMessages.filter(msg => msg.messageHash).length;
          
          const onChainMessages = allMessages.filter(msg => msg.transactionHash);
          const totalHashesLoggedOnChain = onChainMessages.length;
          
          const confirmedTransactions = onChainMessages.filter(msg => msg.status === 'chain_confirmed').length;
          const pendingTransactions = onChainMessages.filter(msg => msg.status === 'chain_pending').length;
          const failedTransactions = onChainMessages.filter(msg => msg.status === 'chain_failed').length;

          let totalGas = 0;
          let gasCount = 0;
          onChainMessages.forEach(msg => {
            if (msg.mockGasFee && msg.status === 'chain_confirmed') {
              const fee = parseFloat(msg.mockGasFee.split(" ")[0]);
              if (!isNaN(fee)) {
                totalGas += fee;
                gasCount++;
              }
            }
          });
          const totalGasFeesEth = totalGas;
          const averageGasFeeEth = gasCount > 0 ? totalGas / gasCount : 0;
          
          // Using existing mock values for these as they are not easily derived from current local data
          const averageConfirmationTimeMs = initialAnalyticsData.averageConfirmationTimeMs; 
          const tamperedMessagesDetected = initialAnalyticsData.tamperedMessagesDetected;
          const aiAdvisorInteractions = initialAnalyticsData.aiAdvisorInteractions;


          setAnalyticsData({
            totalMessagesSent,
            totalMessagesHashed,
            totalHashesLoggedOnChain,
            confirmedTransactions,
            pendingTransactions,
            failedTransactions,
            averageConfirmationTimeMs,
            totalGasFeesEth,
            averageGasFeeEth,
            tamperedMessagesDetected,
            aiAdvisorInteractions,
          });

        } catch (error) {
          console.error("Failed to load analytics data:", error);
        }
        setIsLoading(false);
      };
      fetchAnalyticsData();
    }
  }, [user]);

  const transactionStatusData = useMemo(() => [
    { name: 'Confirmed', value: analyticsData.confirmedTransactions, fill: 'hsl(var(--chart-2))' }, // Green
    { name: 'Pending', value: analyticsData.pendingTransactions, fill: 'hsl(var(--chart-4))' }, // Yellow
    { name: 'Failed', value: analyticsData.failedTransactions, fill: 'hsl(var(--chart-1))' }, // Red
  ], [analyticsData.confirmedTransactions, analyticsData.pendingTransactions, analyticsData.failedTransactions]);
  
  const chartConfig = {
    transactions: {
      label: "Transactions",
    },
    confirmed: {
      label: "Confirmed",
      color: "hsl(var(--chart-2))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-4))",
    },
    failed: {
      label: "Failed",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


  if (authLoading || !user || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-1" />
                <Skeleton className="h-8 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-headline">Analytics Dashboard</CardTitle>
          </div>
          <CardDescription>
            Overview of message activity and mock blockchain performance. Data is session-based from local storage.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages Sent</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter value={analyticsData.totalMessagesSent} />
            <p className="text-xs text-muted-foreground">All messages initiated by user.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hashes Logged On-Chain</CardTitle>
            <BookCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter value={analyticsData.totalHashesLoggedOnChain} />
            <p className="text-xs text-muted-foreground">Messages with (mock) blockchain record.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confirmation Time</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(analyticsData.averageConfirmationTimeMs / 1000).toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">Mocked average time for on-chain confirmation.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gas Fees (Mock)</CardTitle>
            <Network className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.totalGasFeesEth.toFixed(4)} <span className="text-lg">ETH</span></div>
            <p className="text-xs text-muted-foreground">Sum of (mock) gas fees for confirmed txs.</p>
          </CardContent>
        </Card>

         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Advisor Interactions</CardTitle>
            <Bot className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <AnimatedCounter value={analyticsData.aiAdvisorInteractions} />
            <p className="text-xs text-muted-foreground">Mock count of security advice requests.</p>
          </CardContent>
        </Card>

         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tampered Messages</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{analyticsData.tamperedMessagesDetected}</div>
            <p className="text-xs text-muted-foreground">Mock count via integrity checker.</p>
          </CardContent>
        </Card>
        
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Address</CardTitle>
                <Wallet className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-sm font-mono truncate" title={user.walletAddress || user.email || user.id}>
                    {user.walletAddress ? `${user.walletAddress.substring(0,10)}...` : (user.email || 'N/A')}
                </p>
                <p className="text-xs text-muted-foreground">Connected user identifier.</p>
            </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contract Address</CardTitle>
                <Landmark className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-sm font-mono truncate" title={contractAddress}>
                    {contractAddress.startsWith('0x') ? `${contractAddress.substring(0,10)}...` : contractAddress}
                </p>
                <p className="text-xs text-muted-foreground">Configured smart contract.</p>
            </CardContent>
        </Card>


      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-headline">Transaction Status Distribution</CardTitle>
          </div>
          <CardDescription>Breakdown of (mock) on-chain transaction statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.totalHashesLoggedOnChain > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={transactionStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                          {`${transactionStatusData[index].name} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                      );
                    }}
                  >
                    {transactionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                   <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No on-chain transaction data yet to display.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
