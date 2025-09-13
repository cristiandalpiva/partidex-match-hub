import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Field {
  id: string;
  name: string;
  location: string;
  city?: string;
  address?: string;
  price: number;
  photo_url?: string;
}

const FieldSearch = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<string>('none');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    filterFields();
  }, [searchTerm, fields, cityFilter, priceSort]);

  const loadFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setFields(data);
        // Extract unique cities for filter
        const uniqueCities = [...new Set(data.map(field => field.city).filter(Boolean))] as string[];
        setCities(uniqueCities);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las canchas disponibles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFields = () => {
    let filtered = [...fields];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(field => 
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by city
    if (cityFilter && cityFilter !== 'all') {
      filtered = filtered.filter(field => field.city === cityFilter);
    }

    // Sort by price
    if (priceSort === 'asc') {
      filtered = filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (priceSort === 'desc') {
      filtered = filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setFilteredFields(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCityFilter('all');
    setPriceSort('none');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Buscar Canchas</h2>
        <Search className="w-6 h-6 text-gold-premium" />
      </div>

      {/* Search Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por nombre, ubicación o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin orden</SelectItem>
                <SelectItem value="asc">Menor precio</SelectItem>
                <SelectItem value="desc">Mayor precio</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-premium"></div>
        </div>
      ) : filteredFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFields.slice(0, 6).map((field) => (
            <Card key={field.id} className="hover:shadow-lg transition-all hover-lift">
              <CardContent className="p-4">
                {field.photo_url && (
                  <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={field.photo_url} 
                      alt={field.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground truncate">{field.name}</h3>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{field.location}</span>
                  </div>
                  
                  {field.city && (
                    <Badge variant="secondary" className="text-xs">
                      {field.city}
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-dynamic font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatPrice(Number(field.price))}</span>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <Calendar className="w-4 h-4 mr-1" />
                      Reservar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No se encontraron canchas</h3>
          <p className="text-sm text-muted-foreground">
            Intenta modificar los filtros de búsqueda
          </p>
        </div>
      )}

      {filteredFields.length > 6 && (
        <div className="mt-4 text-center">
          <Button variant="outline">
            Ver todas las {filteredFields.length} canchas
          </Button>
        </div>
      )}
    </div>
  );
};

export default FieldSearch;