import { FastifyRequest } from 'fastify';
import {
  SearchFeeStructuresQuery,
  SearchFeeStructuresResponse,
  SearchPageQuery,
  SearchPageResponse
} from './searches.schema';
import { searchFeeStructurePage, searchFeeStructures } from './searches.service';

export async function getSearchPageHandler(
  request: FastifyRequest<{ Querystring: SearchPageQuery }>
): Promise<SearchPageResponse> {
  return searchFeeStructurePage(request.query);
}

export async function getSearchFeeStructuresHandler(
  request: FastifyRequest<{ Querystring: SearchFeeStructuresQuery }>
): Promise<SearchFeeStructuresResponse> {
  return searchFeeStructures(request.query);
}
