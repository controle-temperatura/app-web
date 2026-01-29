"use client"

import { useCompany } from "@/hooks/use-company"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Building2, Mail, Phone, MapPin, FileText, Upload, X } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"

const companyFormSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
    shortName: z.string().optional(),
    cnpj: z.string().optional(),
    contactMail: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

export default function CompanyPage() {
    const { company, isLoading, error, updateCompany } = useCompany()
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: "",
            shortName: "",
            cnpj: "",
            contactMail: "",
            contactPhone: "",
            address: "",
        },
    })

    useEffect(() => {
        if (company) {
            form.reset({
                name: company.name || "",
                shortName: company.shortName || "",
                cnpj: company.cnpj || "",
                contactMail: company.contactMail || "",
                contactPhone: company.contactPhone || "",
                address: company.address || "",
            })
            if (company.logoUrl) {
                setLogoPreview(company.logoUrl)
            }
        }
    }, [company, form])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Por favor, selecione apenas arquivos de imagem")
                return
            }
            
            if (file.size > 5 * 1024 * 1024) {
                toast.error("A imagem deve ter no máximo 5MB")
                return
            }

            setLogoFile(file)
            
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveLogo = () => {
        setLogoFile(null)
        setLogoPreview(company?.logoUrl || null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const onSubmit = async (data: CompanyFormValues) => {
        try {
            if (logoFile) {
                const formData = new FormData()
                formData.append('logo', logoFile)
                
                // TODO: Implement logo upload endpoint
                // const logoResponse = await api.post<{ logoUrl: string }>("/company/logo", formData)
                // data.logoUrl = logoResponse.logoUrl
                
                toast.info("Upload de logo será implementado em breve")
            }
            
            await updateCompany(data)
            setLogoFile(null)
            toast.success("Dados da empresa atualizados com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar dados da empresa")
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-red-500">Erro ao carregar dados da empresa</p>
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-8">
            {/* Header Section */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                    Configurações da Empresa
                </h1>
                <p className="text-lg text-muted-foreground">
                    Gerencie as informações e identidade visual da sua empresa
                </p>
            </div>

            {/* Single Card Container */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Building2 className="w-6 h-6 text-primary" />
                        Informações da Empresa
                    </CardTitle>
                    <CardDescription className="text-base">
                        Mantenha os dados da sua empresa sempre atualizados
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Logo Upload Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2">
                                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Logo da Empresa
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-muted/30">
                                    {logoPreview ? (
                                        <div className="relative group flex-shrink-0">
                                            <div className="relative w-40 h-40 rounded-xl border-2 border-dashed border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 transition-all hover:border-primary/40">
                                                <Image
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    fill
                                                    className="object-contain p-4"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={handleRemoveLogo}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-40 h-40 flex-shrink-0 rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-background hover:bg-muted hover:border-muted-foreground/40 transition-all cursor-pointer group"
                                        >
                                            <div className="text-center">
                                                <Upload className="mx-auto h-10 w-10 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors" />
                                                <p className="mt-2 text-sm font-medium text-muted-foreground">Clique para adicionar</p>
                                            </div>
                                        </button>
                                    )}
                                    
                                    <div className="flex-1 space-y-3 w-full md:w-auto">
                                        <div>
                                            <h3 className="font-semibold text-base mb-1">Identidade Visual</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Faça upload da logo da sua empresa para personalização
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {logoPreview ? "Alterar Logo" : "Selecionar Logo"}
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoChange}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG ou WEBP • Tamanho máximo: 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2">
                                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Identificação
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                                </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold">
                                                        Nome da Empresa *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Digite o nome completo" 
                                                            className="h-11"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="shortName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold">Nome Curto</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Nome abreviado" 
                                                            className="h-11"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs">
                                                        Nome simplificado para exibição
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="cnpj"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-primary" />
                                                    CNPJ
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="00.000.000/0000-00" 
                                                        className="h-11"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Contact Information Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Contato
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="contactMail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-primary" />
                                                        Email de Contato
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="email"
                                                            placeholder="empresa@exemplo.com" 
                                                            className="h-11"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="contactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-primary" />
                                                        Telefone de Contato
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="(00) 00000-0000" 
                                                            className="h-11"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Localização
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    Endereço Completo
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Rua, número, bairro, cidade e estado" 
                                                        className="h-11"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Endereço completo da sua empresa
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            form.reset()
                                            handleRemoveLogo()
                                        }}
                                        disabled={form.formState.isSubmitting}
                                        className="min-w-[120px]"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        size="lg"
                                        disabled={form.formState.isSubmitting}
                                        className="min-w-[160px]"
                                    >
                                        {form.formState.isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            "Salvar Alterações"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
        </div>
    )
}